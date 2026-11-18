import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'
import { Learner } from './models/Learner.js'
import { ChatMessage } from './models/ChatMessage.js'
import { demoLearner, demoMessages, makePlan } from './data/demo.js'

const app = express()
const port = process.env.PORT || 5000
const demoId = demoLearner._id
let mongoAvailable = false
let memoryLearner = structuredClone(demoLearner)
const memoryMessages = [...demoMessages]

function tutorProvider() {
  const openRouterKey = process.env.OPENROUTER_API_KEY?.trim()
  if (openRouterKey) return {
    provider: 'openrouter',
    key: openRouterKey,
    url: 'https://openrouter.ai/api/v1/chat/completions',
    model: process.env.OPENROUTER_MODEL || 'openrouter/free',
  }

  const legacyKey = process.env.OPENAI_API_KEY?.trim()
  if (legacyKey?.startsWith('sk-or-')) return {
    provider: 'openrouter',
    key: legacyKey,
    url: 'https://openrouter.ai/api/v1/chat/completions',
    model: process.env.OPENROUTER_MODEL || process.env.OPENAI_MODEL || 'openrouter/free',
  }
  if (legacyKey) return {
    provider: 'openai',
    key: legacyKey,
    url: 'https://api.openai.com/v1/chat/completions',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  }
  return null
}

app.use(cors())
app.use(express.json({ limit: '32kb' }))

async function connectMongo() {
  if (!process.env.MONGO_URI) return
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 2500 })
    mongoAvailable = true
    let learner = await Learner.findOne({ email: demoLearner.email })
    if (!learner) {
      const { _id: _demoId, ...seed } = demoLearner
      learner = await Learner.create(seed)
    }
    console.log('MongoDB connected; using persistent learner data.')
  } catch (error) {
    console.warn(`MongoDB unavailable (${error.message}). Starting in demo mode.`)
  }
}

async function getLearner() {
  if (!mongoAvailable) return memoryLearner
  return Learner.findOne({ email: demoLearner.email })
}

async function saveLearner(learner) {
  if (!mongoAvailable) {
    memoryLearner = learner
    return memoryLearner
  }
  const plain = typeof learner.toObject === 'function' ? learner.toObject() : learner
  const { _id, __v, createdAt, updatedAt, ...fields } = plain
  return Learner.findOneAndUpdate({ email: demoLearner.email }, fields, { new: true, runValidators: true })
}

function plain(value) {
  if (!value) return value
  return typeof value.toObject === 'function' ? value.toObject() : value
}

function weeklyStudy(minutes) {
  const pattern = [12, 24, 0, 31, 18, 0, 26]
  const targetTotal = Math.max(minutes || 0, 60)
  const base = pattern.reduce((sum, value) => sum + value, 0)
  return pattern.map((value, index) => ({ day: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][index], minutes: Math.round(value * targetTotal / base) }))
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok', storage: mongoAvailable ? 'mongodb' : 'demo' }))

app.get('/api/dashboard', async (_req, res, next) => {
  try {
    const learner = plain(await getLearner())
    res.json({
      profile: {
        id: learner._id,
        name: learner.name,
        avatar: learner.avatar,
        interests: learner.interests,
        level: learner.level,
        learningStyle: learner.learningStyle,
        dailyGoal: learner.dailyGoal,
        streak: learner.streak,
        completedMinutes: learner.completedMinutes,
      },
      plan: learner.activePlan,
      stats: { minutes: learner.completedMinutes, streak: learner.streak, weeklyStudy: weeklyStudy(learner.completedMinutes) },
      tutorMode: tutorProvider() ? 'ai' : 'demo',
      tutorProvider: tutorProvider()?.provider || 'demo',
      storageMode: mongoAvailable ? 'mongodb' : 'demo',
    })
  } catch (error) { next(error) }
})

app.patch('/api/profile', async (req, res, next) => {
  try {
    const learner = await getLearner()
    const body = req.body || {}
    if (typeof body.name === 'string' && body.name.trim()) learner.name = body.name.trim().slice(0, 50)
    if (Array.isArray(body.interests)) learner.interests = body.interests.map(item => String(item).trim()).filter(Boolean).slice(0, 8)
    if (['beginner', 'intermediate', 'advanced'].includes(body.level)) learner.level = body.level
    if (['hands-on', 'visual', 'reading', 'listening'].includes(body.learningStyle)) learner.learningStyle = body.learningStyle
    if (Number.isFinite(Number(body.dailyGoal))) learner.dailyGoal = Math.min(120, Math.max(5, Number(body.dailyGoal)))
    learner.avatar = learner.name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase()
    await saveLearner(learner)
    res.json({ profile: { name: learner.name, avatar: learner.avatar, interests: learner.interests, level: learner.level, learningStyle: learner.learningStyle, dailyGoal: learner.dailyGoal } })
  } catch (error) { next(error) }
})

app.post('/api/plan', async (req, res, next) => {
  try {
    const learner = await getLearner()
    if (!req.body?.goal || typeof req.body.goal !== 'string') return res.status(400).json({ error: 'Add a learning goal to build your path.' })
    learner.activePlan = makePlan(req.body.goal, learner)
    await saveLearner(learner)
    res.status(201).json({ plan: learner.activePlan })
  } catch (error) { next(error) }
})

app.patch('/api/lessons/:lessonId/complete', async (req, res, next) => {
  try {
    const learner = await getLearner()
    const plan = learner.activePlan
    const index = plan.lessons.findIndex(lesson => lesson.id === req.params.lessonId)
    if (index < 0) return res.status(404).json({ error: 'Lesson not found.' })
    const lesson = plan.lessons[index]
    if (lesson.status !== 'completed') {
      lesson.status = 'completed'
      const nextLesson = plan.lessons.find(item => item.status === 'upcoming')
      if (nextLesson) nextLesson.status = 'current'
      const completeCount = plan.lessons.filter(item => item.status === 'completed').length
      plan.progress = Math.round(completeCount / plan.lessons.length * 100)
      learner.completedMinutes += lesson.duration
    }
    await saveLearner(learner)
    res.json({ plan, completedMinutes: learner.completedMinutes })
  } catch (error) { next(error) }
})

function demoTutorReply(message, learner) {
  const text = message.toLowerCase()
  if (text.includes('persona')) return `A user persona is a small, evidence-based snapshot of someone you're designing for. For your product design path, try this: pick one person you know, write down a goal they have, then add one frustration that gets in their way. What might that person be trying to accomplish?`
  if (text.includes('quiz') || text.includes('test me')) return `Quick check-in: when you're learning about a new product, what's one thing you could observe that might reveal a user's needs? Take a guess and I'll help you build on it.`
  if (text.includes('explain') || text.includes('confus') || text.includes('what is')) return `Let's make it concrete. Think of a product you used today that felt easy. Someone probably paid attention to the user's context, not just the screen. Start by telling me what you were trying to do, and we can unpack the design choices together.`
  if (text.includes('plan') || text.includes('learn')) return `I can help you make this manageable. Since you learn best by ${learner.learningStyle.replace('-', ' ')} practice, let's pick one small idea and try it today. What's the part of “${learner.activePlan.title}” you'd like to understand first?`
  return `Good question. Here's a useful way to approach it: connect the idea to something you already care about (${learner.interests[0] || 'your interests'}), then test it with one small example. What have you tried so far?`
}

async function getTutorAnswer(message, learner, history, provider) {
  if (!provider) return demoTutorReply(message, learner)
  const messages = [
    { role: 'system', content: `You are Morrow, a warm and practical personal learning coach. The learner is ${learner.name}, at a ${learner.level} level. Their interests are ${(learner.interests || []).join(', ')}. They learn best through ${learner.learningStyle} activities and are studying ${learner.activePlan.title}. Explain with concrete examples related to their interests, ask one useful follow-up question, and help them reason rather than simply giving away answers. Keep replies concise and encouraging.` },
    ...history.slice(-10).map(item => ({ role: item.role, content: item.content })),
    { role: 'user', content: message },
  ]
  const headers = {
    Authorization: `Bearer ${provider.key}`,
    'Content-Type': 'application/json',
  }
  if (provider.provider === 'openrouter') headers['X-Title'] = 'Morrow Learning Agent'
  const response = await fetch(provider.url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ model: provider.model, messages, temperature: 0.7, max_tokens: 350 }),
  })
  if (!response.ok) throw new Error(`Tutor provider returned ${response.status}.`)
  const data = await response.json()
  return data.choices?.[0]?.message?.content?.trim() || 'I’m here with you. Can you tell me a little more about what you’re exploring?'
}

app.get('/api/chat/history', async (_req, res, next) => {
  try {
    if (mongoAvailable) {
      const learner = await getLearner()
      const messages = await ChatMessage.find({ learnerId: learner._id }).sort({ createdAt: 1 }).limit(40).lean()
      return res.json({ messages: messages.map(item => ({ role: item.role, content: item.content, at: item.createdAt })) })
    }
    res.json({ messages: memoryMessages })
  } catch (error) { next(error) }
})

app.post('/api/chat', async (req, res, next) => {
  try {
    const message = String(req.body?.message || '').trim().slice(0, 2000)
    if (!message) return res.status(400).json({ error: 'Write a message first.' })
    const learner = plain(await getLearner())
    const history = mongoAvailable
      ? await ChatMessage.find({ learnerId: learner._id }).sort({ createdAt: 1 }).limit(10).lean()
      : memoryMessages.slice(-10)
    const provider = tutorProvider()
    const reply = await getTutorAnswer(message, learner, history, provider)
    const userMessage = { role: 'user', content: message, at: new Date().toISOString() }
    const assistantMessage = { role: 'assistant', content: reply, at: new Date().toISOString() }
    if (mongoAvailable) {
      await ChatMessage.create([
        { learnerId: learner._id, role: 'user', content: message },
        { learnerId: learner._id, role: 'assistant', content: reply },
      ])
    } else {
      memoryMessages.push(userMessage, assistantMessage)
      if (memoryMessages.length > 80) memoryMessages.splice(0, memoryMessages.length - 80)
    }
    res.json({ reply, mode: provider ? 'ai' : 'demo', provider: provider?.provider || 'demo' })
  } catch (error) { next(error) }
})

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ error: 'Something went wrong. Please try again.' })
})

await connectMongo()
app.listen(port, () => console.log(`Morrow API listening on http://localhost:${port}`))
