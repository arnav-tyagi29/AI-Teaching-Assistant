import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDownRight, ArrowUpRight, BookOpen, Check, CheckCircle2, ChevronDown,
  ChevronLeft, ChevronRight, CircleHelp, Clock3, Compass, Flame, Leaf,
  Lightbulb, LoaderCircle, Menu, MessageCircle, MoreHorizontal, Plus,
  Send, Sparkles, Target, X,
} from 'lucide-react'

const fallback = {
  profile: { name: 'Alex Morgan', avatar: 'AM', interests: ['Product design', 'Psychology', 'Sustainability'], level: 'beginner', learningStyle: 'hands-on', dailyGoal: 25, streak: 4, completedMinutes: 185 },
  plan: {
    title: 'Product design foundations', subtitle: 'A hands-on path built around the way you learn', progress: 40,
    lessons: [
      { id: 'discover', title: 'Design thinking, made simple', description: 'Learn to notice the small moments that shape a great experience.', duration: 12, type: 'Read & reflect', status: 'completed', accent: 'mint' },
      { id: 'empathy', title: 'Get curious about people', description: 'Turn everyday observations into useful user insights.', duration: 18, type: 'Interactive', status: 'completed', accent: 'peach' },
      { id: 'personas', title: 'Sketch your first user persona', description: 'Build a tiny profile for a real person you want to help.', duration: 20, type: 'Mini project', status: 'current', accent: 'lavender' },
      { id: 'journeys', title: 'Map the moments that matter', description: 'See a product through someone else’s eyes.', duration: 15, type: 'Visual exercise', status: 'upcoming', accent: 'blue' },
      { id: 'prototype', title: 'Make an idea tangible', description: 'Create a quick prototype and learn from it.', duration: 25, type: 'Mini project', status: 'upcoming', accent: 'butter' },
    ],
  },
  stats: { minutes: 185, streak: 4, weeklyStudy: [{ day: 'M', minutes: 18 }, { day: 'T', minutes: 36 }, { day: 'W', minutes: 0 }, { day: 'T', minutes: 46 }, { day: 'F', minutes: 26 }, { day: 'S', minutes: 0 }, { day: 'S', minutes: 38 }] },
  tutorMode: 'demo', storageMode: 'demo',
}

const navItems = [
  { id: 'today', label: 'Today', icon: Compass },
  { id: 'path', label: 'My learning path', icon: BookOpen },
  { id: 'tutor', label: 'AI tutor', icon: MessageCircle },
]

const greeting = () => {
  const hour = new Date().getHours()
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
}

async function request(url, options) {
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.error || 'Something went wrong. Please try again.')
  return payload
}

export default function App() {
  const [activeView, setActiveView] = useState('today')
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [pathModal, setPathModal] = useState(false)
  const [profileModal, setProfileModal] = useState(false)
  const [activeLesson, setActiveLesson] = useState(null)

  useEffect(() => {
    request('/api/dashboard').then(setDashboard).catch(() => {
      setDashboard(fallback)
      setNotice('Showing demo data — connect the API to save your progress.')
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!notice) return undefined
    const timer = setTimeout(() => setNotice(''), 4500)
    return () => clearTimeout(timer)
  }, [notice])

  const updateDashboard = (patch) => setDashboard(current => ({ ...current, ...patch }))
  const completeLesson = async lesson => {
    try {
      const result = await request(`/api/lessons/${lesson.id}/complete`, { method: 'PATCH' })
      updateDashboard({ plan: result.plan, stats: { ...data.stats, minutes: result.completedMinutes } })
      setActiveLesson(null)
      setNotice('Lovely work. Your progress is saved.')
    } catch { setNotice('Could not save progress right now.') }
  }

  if (loading && !dashboard) return <div className="boot-screen"><div className="brand-mark"><Leaf size={19} /></div><span>Finding your learning rhythm…</span></div>
  const data = dashboard || fallback
  const currentLesson = data.plan.lessons.find(item => item.status === 'current') || data.plan.lessons.find(item => item.status !== 'completed') || data.plan.lessons.at(-1)

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand-lockup" onClick={() => setActiveView('today')} aria-label="Morrow home">
          <span className="brand-mark"><Leaf size={18} strokeWidth={2.2} /></span>
          <span className="brand-name">morrow<span>.</span></span>
        </button>
        <div className="workspace-label">YOUR SPACE <button aria-label="Workspace options"><MoreHorizontal size={17} /></button></div>
        <nav className="primary-nav" aria-label="Main navigation">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-item ${activeView === id ? 'active' : ''}`} onClick={() => setActiveView(id)}>
              <Icon size={18} strokeWidth={1.85} /><span>{label}</span>{id === 'tutor' && <span className="nav-new">NEW</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-divider" />
        <div className="workspace-label">YOUR FOCUS</div>
        <button className="focus-mini" onClick={() => setActiveView('path')}>
          <span className="focus-mini-icon"><Target size={16} /></span>
          <span className="focus-mini-copy"><strong>{data.plan.title}</strong><small>{data.plan.progress}% complete</small></span>
          <ChevronRight size={15} />
        </button>
        <div className="sidebar-spacer" />
        <button className="help-link" onClick={() => setActiveView('tutor')}><CircleHelp size={17} /><span>Need a hand?</span><ChevronRight size={15} /></button>
        <button className="profile-pill" onClick={() => setProfileModal(true)}>
          <span className="avatar">{data.profile.avatar}</span>
          <span className="profile-pill-copy"><strong>{data.profile.name}</strong><small>Your learning profile</small></span>
          <ChevronDown size={15} />
        </button>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><span>My space</span><ChevronRight size={14} /><strong>{activeView === 'today' ? 'Today' : activeView === 'path' ? 'My learning path' : activeView === 'tutor' ? 'AI tutor' : 'My profile'}</strong></div>
          <div className="topbar-actions"><span className="today-date">{new Intl.DateTimeFormat('en', { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date())}</span><button className="icon-button" onClick={() => setActiveView('tutor')} aria-label="Ask your tutor"><MessageCircle size={18} /><i /></button><div className="avatar avatar-small">{data.profile.avatar}</div></div>
        </header>

        {notice && <div className="toast"><Lightbulb size={16} /><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss"><X size={15} /></button></div>}

        {activeView === 'today' && <Dashboard data={data} currentLesson={currentLesson} onView={setActiveView} onNewPlan={() => setPathModal(true)} onEditProfile={() => setProfileModal(true)} onStart={setActiveLesson} />}
        {activeView === 'path' && <LearningPath data={data} onNewPlan={() => setPathModal(true)} onStart={setActiveLesson} />}
        {activeView === 'tutor' && <Tutor profile={data.profile} onBack={() => setActiveView('today')} />}
      </main>

      {pathModal && <NewPathModal onClose={() => setPathModal(false)} onCreate={async goal => {
        const result = await request('/api/plan', { method: 'POST', body: JSON.stringify({ goal }) })
        updateDashboard({ plan: result.plan })
        setActiveView('path')
        setPathModal(false)
        setNotice(`Your learning path for “${result.plan.title}” is ready.`)
      }} />}
      {profileModal && <ProfileModal profile={data.profile} onClose={() => setProfileModal(false)} onSave={async profile => {
        const result = await request('/api/profile', { method: 'PATCH', body: JSON.stringify(profile) })
        updateDashboard({ profile: { ...data.profile, ...result.profile } })
        setProfileModal(false)
        setNotice('Your learning profile is up to date.')
      }} />}
      {activeLesson && <LessonModal lesson={activeLesson} profile={data.profile} onClose={() => setActiveLesson(null)} onComplete={completeLesson} />}
    </div>
  )
}

function Dashboard({ data, currentLesson, onView, onNewPlan, onEditProfile, onStart }) {
  const completeCount = data.plan.lessons.filter(item => item.status === 'completed').length
  return (
    <div className="page-content dashboard-page">
      <div className="page-heading-row">
        <div><p className="eyebrow">{new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date()).toUpperCase()}</p><h1>{greeting()}, {data.profile.name.split(' ')[0]} <span className="wave">✳</span></h1><p className="subheading">A little learning today goes a long way.</p></div>
        <button className="streak-chip"><span className="streak-icon"><Flame size={17} fill="currentColor" /></span><span><strong>{data.stats.streak} day streak</strong><small>You’re building a lovely habit</small></span><ArrowUpRight size={15} /></button>
      </div>

      <section className="hero-card">
        <div className="hero-content">
          <div className="hero-kicker"><span className="sparkle-dot"><Sparkles size={13} /></span> YOUR LEARNING, IN FLOW</div>
          <h2>Small steps.<br /><em>Big possibilities.</em></h2>
          <p>You’re finding your rhythm. Keep going, and the things you’re curious about will start to click.</p>
          <button className="hero-cta" onClick={() => currentLesson && onStart(currentLesson)}><span>{currentLesson?.status === 'current' ? 'Continue learning' : 'Review your path'}</span><ChevronRight size={17} /></button>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit orbit-three" />
          <div className="orbit-core"><span className="core-leaf"><Leaf size={35} strokeWidth={1.4} /></span><span className="core-caption">YOUR PACE<br />YOUR PATH</span></div>
          <span className="orbit-spark spark-a">✳</span><span className="orbit-spark spark-b">✦</span><span className="orbit-spark spark-c">✧</span>
          <span className="orbit-tag tag-one"><span>✦</span> curious</span><span className="orbit-tag tag-two">in motion <ArrowUpRight size={12} /></span>
        </div>
        <div className="hero-footer"><span><span className="hero-footer-dot" /> BUILT AROUND YOU</span><span>YOUR NEXT CHAPTER STARTS HERE <ArrowUpRight size={12} /></span></div>
      </section>

      <div className="dashboard-grid">
        <div className="dashboard-main-col">
          <section className="section-block path-preview">
            <div className="section-heading"><div><p className="eyebrow">THE BIG PICTURE</p><h2>Your learning path</h2></div><button className="text-link" onClick={() => onView('path')}>See full path <ArrowUpRight size={15} /></button></div>
            <div className="path-card">
              <div className="path-card-top"><div className="path-topic-icon"><Compass size={19} /></div><div className="path-title-wrap"><h3>{data.plan.title}</h3><p>{data.plan.subtitle}</p></div><button className="more-button" onClick={onNewPlan} aria-label="Create a learning path"><MoreHorizontal size={18} /></button></div>
              <div className="path-progress-line"><span>YOUR PROGRESS</span><strong>{data.plan.progress}%</strong><div className="progress-track"><span style={{ width: `${data.plan.progress}%` }} /></div><small>{completeCount} of {data.plan.lessons.length} steps</small></div>
              <div className="path-steps">
                {data.plan.lessons.slice(0, 5).map((lesson, index) => <button key={lesson.id} onClick={() => onView('path')} className={`step ${lesson.status}`} title={lesson.title}><span className="step-node">{lesson.status === 'completed' ? <Check size={13} /> : index + 1}</span><span className="step-label">{lesson.status === 'current' ? 'YOU ARE HERE' : lesson.status === 'completed' ? 'DONE' : `STEP 0${index + 1}`}</span>{index < Math.min(4, data.plan.lessons.length - 1) && <span className="step-line" />}</button>)}
              </div>
            </div>
          </section>

          <section className="section-block next-lesson-section">
            <div className="section-heading"><div><p className="eyebrow">A GOOD PLACE TO PICK UP</p><h2>Your next lesson</h2></div><button className="text-link" onClick={() => onView('path')}>All lessons <ArrowUpRight size={15} /></button></div>
            {currentLesson ? <LessonCard lesson={currentLesson} onClick={() => onStart(currentLesson)} /> : <div className="empty-card"><CheckCircle2 size={22} /><strong>You’ve reached the end of this path.</strong><button onClick={onNewPlan}>Choose what’s next <ChevronRight size={15} /></button></div>}
          </section>
        </div>

        <aside className="dashboard-side-col">
          <section className="week-card">
            <div className="section-heading compact"><div><p className="eyebrow">STEADY WINS</p><h2>Your week</h2></div><button className="round-arrow" aria-label="Weekly summary"><ArrowUpRight size={16} /></button></div>
            <div className="week-total"><strong>{data.stats.minutes}<span> min</span></strong><small>learning this month</small><span className="week-change"><ArrowUpRight size={12} /> 12%</span></div>
            <div className="mini-chart" aria-label="Study minutes by day">
              {data.stats.weeklyStudy.map((day, index) => <div className="chart-col" key={`${day.day}-${index}`}><span className={`chart-bar ${day.minutes === 0 ? 'empty' : ''} ${index === 3 ? 'highlight' : ''}`} style={{ height: `${Math.max(5, day.minutes * 1.5)}px` }}><i>{day.minutes > 0 && `${day.minutes}m`}</i></span><small>{day.day}</small></div>)}
            </div>
            <div className="goal-note"><span className="goal-check"><Check size={12} /></span><span><strong>{data.profile.dailyGoal} min a day</strong> is your sweet spot</span><button onClick={onEditProfile} aria-label="Edit daily goal"><ArrowUpRight size={13} /></button></div>
          </section>

          <section className="tutor-teaser">
            <div className="teaser-icon"><Sparkles size={18} /></div><button className="teaser-more" onClick={() => onView('tutor')} aria-label="Open tutor"><ArrowUpRight size={15} /></button>
            <p className="eyebrow">A THOUGHTFUL SIDEKICK</p><h3>Questions are<br />how we grow.</h3><p>Get unstuck, get curious, or just think out loud with your personal tutor.</p><button className="teaser-link" onClick={() => onView('tutor')}>Meet your tutor <ChevronRight size={15} /></button>
            <span className="teaser-orb orb-a" /><span className="teaser-orb orb-b" />
          </section>
          <div className="personalized-note"><span className="personalized-icon"><Sparkles size={14} /></span><span>Made for the way <strong>you</strong> learn</span><button onClick={onEditProfile}>Tune it <ChevronRight size={13} /></button></div>
        </aside>
      </div>
    </div>
  )
}

function LessonCard({ lesson, onClick }) {
  return <button className="lesson-card" onClick={onClick}>
    <div className={`lesson-illustration ${lesson.accent || 'mint'}`}><span className="lesson-illustration-sun" /><span className="lesson-illustration-leaf"><Leaf size={27} strokeWidth={1.4} /></span><span className="lesson-illustration-line" /></div>
    <div className="lesson-info"><div className="lesson-meta"><span className="current-badge"><i /> UP NEXT</span><span>{lesson.type}</span></div><h3>{lesson.title}</h3><p>{lesson.description}</p><div className="lesson-bottom"><span><Clock3 size={14} /> {lesson.duration} min</span><span className="lesson-cta">Start lesson <ChevronRight size={15} /></span></div></div>
    <span className="lesson-arrow"><ChevronRight size={18} /></span>
  </button>
}

function LearningPath({ data, onNewPlan, onStart }) {
  return <div className="page-content learning-path-page">
    <div className="page-heading-row"><div><p className="eyebrow">BUILT AROUND YOUR CURIOSITY</p><h1>Your learning path</h1><p className="subheading">One thoughtful step at a time. You’re doing great.</p></div><button className="primary-button" onClick={onNewPlan}><Plus size={17} /> New learning goal</button></div>
    <section className="path-overview-card"><div className="overview-copy"><span className="path-topic-icon"><Compass size={19} /></span><div><span className="eyebrow">YOUR CURRENT FOCUS</span><h2>{data.plan.title}</h2><p>{data.plan.subtitle}</p></div></div><div className="overview-progress"><div><strong>{data.plan.progress}%</strong><span>complete</span></div><div className="progress-track"><span style={{ width: `${data.plan.progress}%` }} /></div><small>{data.plan.lessons.filter(item => item.status === 'completed').length} of {data.plan.lessons.length} learning moments</small></div></section>
    <div className="path-section-title"><div><p className="eyebrow">YOUR JOURNEY</p><h2>The steps along the way</h2></div><span className="path-step-count"><span /> {data.plan.lessons.length} moments</span></div>
    <div className="lesson-list">{data.plan.lessons.map((lesson, index) => <div className={`path-lesson-row ${lesson.status}`} key={lesson.id}><div className="path-rail"><span className="rail-node">{lesson.status === 'completed' ? <Check size={14} /> : `0${index + 1}`}</span>{index < data.plan.lessons.length - 1 && <span className="rail-line" />}</div><div className={`path-lesson-card ${lesson.status}`}><div className={`path-lesson-art ${lesson.accent || 'mint'}`}><span className="art-disc" /><span className="art-branch"><Leaf size={28} /></span></div><div className="path-lesson-copy"><div className="path-lesson-meta"><span className={`status-label ${lesson.status}`}>{lesson.status === 'completed' ? 'COMPLETED' : lesson.status === 'current' ? 'READY WHEN YOU ARE' : 'COMING UP'}</span><span>{lesson.type}</span></div><h3>{lesson.title}</h3><p>{lesson.description}</p><span className="duration"><Clock3 size={13} /> {lesson.duration} min</span></div><button className={`${lesson.status === 'completed' ? 'review-button' : lesson.status === 'current' ? 'start-button' : 'locked-button'}`} disabled={lesson.status === 'upcoming'} onClick={() => onStart(lesson)}>{lesson.status === 'completed' ? 'Revisit' : lesson.status === 'current' ? 'Start lesson' : 'Up next'}{lesson.status !== 'upcoming' && <ChevronRight size={15} />}</button></div></div>)}</div>
    <div className="path-bottom-card"><div className="path-bottom-icon"><Sparkles size={20} /></div><div><strong>Feeling curious about something else?</strong><p>Your path can change as you do. Pick a new goal whenever you’re ready.</p></div><button className="text-link" onClick={onNewPlan}>Create a new path <ArrowUpRight size={15} /></button></div>
  </div>
}

function LessonModal({ lesson, profile, onClose, onComplete }) {
  const [reflection, setReflection] = useState('')
  const completed = lesson.status === 'completed'
  const project = lesson.type.toLowerCase().includes('project')
  return <div className="modal-backdrop lesson-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}><section className="lesson-modal-card"><button className="modal-close" onClick={onClose} aria-label="Close lesson"><X size={18} /></button><div className={`lesson-modal-art ${lesson.accent || 'mint'}`}><span className="modal-art-sun" /><span className="modal-art-leaf"><Leaf size={37} strokeWidth={1.3} /></span><span className="modal-art-ring" /></div><div className="lesson-modal-content"><span className="lesson-modal-meta"><span>{lesson.type.toUpperCase()}</span><i /><Clock3 size={13} /> {lesson.duration} MIN</span><h2>{lesson.title}</h2><p className="lesson-lede">{lesson.description}</p><div className="lesson-learning-note"><span><Sparkles size={16} /></span><div><strong>{project ? 'Try this little experiment' : 'Let’s make it yours'}</strong><p>{project ? `Pick one moment from your day and imagine someone having a hard time with it. Write down what they need and one small thing that could help.` : `Think of something connected to ${profile.interests[0] || 'an interest of yours'}. What makes that experience work well for you? Notice one detail you might otherwise miss.`}</p></div></div><label className="reflection-label" htmlFor="lesson-reflection">{completed ? 'YOUR NOTES' : 'A THOUGHT TO TAKE WITH YOU'}</label><textarea id="lesson-reflection" value={reflection} onChange={event => setReflection(event.target.value)} placeholder="Jot down a thought, question or tiny aha…" rows={3} /><div className="lesson-modal-actions"><span><span className="reflection-spark">✳</span> A moment to think is progress, too</span><button className="primary-button" onClick={() => completed ? onClose() : onComplete(lesson)}>{completed ? <Check size={15} /> : <CheckCircle2 size={15} />}{completed ? 'Done revisiting' : 'Mark this lesson complete'}</button></div></div></section></div>
}

function Tutor({ profile, onBack }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [mode, setMode] = useState('demo')
  const [error, setError] = useState('')
  const bottomRef = useRef(null)
  const starterPrompts = ['Explain personas simply', 'Quiz me on what I learned', 'Help me get unstuck']

  useEffect(() => {
    request('/api/chat/history').then(result => setMessages(result.messages || [])).catch(() => {})
    request('/api/dashboard').then(result => setMode(result.tutorMode)).catch(() => {})
  }, [])
  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages, sending])

  const sendMessage = async (text = input) => {
    const trimmed = text.trim()
    if (!trimmed || sending) return
    setInput(''); setError(''); setSending(true)
    setMessages(current => [...current, { role: 'user', content: trimmed, at: new Date().toISOString() }])
    try {
      const result = await request('/api/chat', { method: 'POST', body: JSON.stringify({ message: trimmed }) })
      setMode(result.mode)
      setMessages(current => [...current, { role: 'assistant', content: result.reply, at: new Date().toISOString() }])
    } catch (sendError) { setError(sendError.message); }
    finally { setSending(false) }
  }

  return <div className="page-content tutor-page">
    <div className="page-heading-row"><div><button className="back-link" onClick={onBack}><ChevronLeft size={15} /> Back to today</button><h1>A space to wonder.</h1><p className="subheading">A friendly tutor who learns how you like to learn.</p></div><div className="tutor-online"><span /> HERE WITH YOU</div></div>
    <div className="tutor-layout"><section className="chat-card">
      <div className="chat-topbar"><div className="tutor-avatar"><Sparkles size={20} /></div><div><strong>Your learning sidekick</strong><small>{mode === 'ai' ? 'Powered by your AI tutor' : 'Ready to explore together'}</small></div><button aria-label="More tutor options"><MoreHorizontal size={19} /></button></div>
      <div className="chat-messages">
        <div className="date-divider"><span>YOUR CONVERSATION</span></div>
        <div className="message-row assistant"><div className="message-avatar"><Sparkles size={13} /></div><div className="message-bubble"><p>Hey {profile.name.split(' ')[0]}! I’m here for whatever’s on your mind. We can untangle a tricky idea, try a quick quiz, or follow a question wherever it takes us.</p><small>Just now</small></div></div>
        {messages.map((message, index) => <div className={`message-row ${message.role}`} key={`${message.at || 'm'}-${index}`}>{message.role === 'assistant' && <div className="message-avatar"><Sparkles size={13} /></div>}<div className="message-bubble"><p>{message.content}</p><small>{message.role === 'user' ? 'You' : 'Morrow'}</small></div></div>)}
        {sending && <div className="message-row assistant"><div className="message-avatar"><Sparkles size={13} /></div><div className="message-bubble typing"><i /><i /><i /></div></div>}
        <div ref={bottomRef} />
      </div>
      {!messages.length && <div className="prompt-suggestions"><span>TRY ASKING</span>{starterPrompts.map(prompt => <button key={prompt} onClick={() => sendMessage(prompt)}>{prompt}<ChevronRight size={14} /></button>)}</div>}
      {error && <div className="chat-error">{error} <button onClick={() => sendMessage(messages.at(-1)?.content || '')}>Try again</button></div>}
      <form className="chat-composer" onSubmit={event => { event.preventDefault(); sendMessage() }}><input value={input} onChange={event => setInput(event.target.value)} placeholder="Ask anything you’re curious about…" maxLength={2000} /><button className="composer-sparkle" type="button" aria-label="Question ideas" onClick={() => sendMessage(starterPrompts[Math.floor(Math.random() * starterPrompts.length)])}><Sparkles size={16} /></button><button type="submit" className="send-button" aria-label="Send message" disabled={!input.trim() || sending}><Send size={16} /></button></form>
      <div className="chat-footnote"><span>✦</span> No question is too small. This is your space to learn out loud.</div>
    </section>
    <aside className="tutor-aside"><div className="tutor-note-card"><span className="note-sun">✳</span><span className="eyebrow">A LITTLE REMINDER</span><h3>Curiosity is<br />a superpower.</h3><p>There’s no rush to get it right. Understanding grows one good question at a time.</p><span className="note-signature">a note from Morrow</span></div><div className="tutor-interests"><span className="eyebrow">THINGS YOU LOVE</span><p>Your tutor can make examples that feel closer to home.</p><div className="interest-chips">{profile.interests.map(item => <span key={item}>{item}</span>)}</div></div></aside></div>
  </div>
}

function NewPathModal({ onClose, onCreate }) {
  const [goal, setGoal] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const suggestions = ['Learn a new language', 'Understand climate science', 'Get started with coding']
  const submit = async event => { event.preventDefault(); if (!goal.trim()) return; setBusy(true); setError(''); try { await onCreate(goal) } catch (err) { setError(err.message) } finally { setBusy(false) } }
  return <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}><section className="modal-card"><button className="modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button><div className="modal-symbol"><Sparkles size={20} /></div><p className="eyebrow">A NEW ADVENTURE</p><h2>What are you curious about?</h2><p className="modal-intro">Tell Morrow what you’d like to learn. We’ll shape a path around your interests and the way you learn best.</p><form onSubmit={submit}><label htmlFor="goal-input">YOUR LEARNING GOAL</label><input id="goal-input" value={goal} onChange={event => setGoal(event.target.value)} placeholder="e.g. Make my first website" maxLength={80} autoFocus /><div className="suggestion-list"><span>NEED A SPARK?</span>{suggestions.map(item => <button type="button" key={item} onClick={() => setGoal(item)}>{item}<ArrowUpRight size={13} /></button>)}</div>{error && <p className="form-error">{error}</p>}<button className="primary-button modal-submit" type="submit" disabled={!goal.trim() || busy}>{busy ? <LoaderCircle className="spin" size={17} /> : <Sparkles size={16} />}{busy ? 'Building your path…' : 'Build my learning path'}</button></form><div className="modal-footer"><span><CheckCircle2 size={14} /> You can change your path anytime</span></div></section></div>
}

function ProfileModal({ profile, onClose, onSave }) {
  const [form, setForm] = useState({ ...profile, interestsText: profile.interests.join(', ') })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const change = (key, value) => setForm(current => ({ ...current, [key]: value }))
  const submit = async event => { event.preventDefault(); setBusy(true); setError(''); try { await onSave({ name: form.name, level: form.level, learningStyle: form.learningStyle, dailyGoal: Number(form.dailyGoal), interests: form.interestsText.split(',').map(item => item.trim()).filter(Boolean) }) } catch (err) { setError(err.message) } finally { setBusy(false) } }
  return <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}><section className="modal-card profile-modal"><button className="modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button><div className="modal-symbol"><Target size={20} /></div><p className="eyebrow">YOUR LEARNING PROFILE</p><h2>Make it feel like you.</h2><p className="modal-intro">Your tutor and learning path use these preferences to choose examples and pacing.</p><form onSubmit={submit}><label htmlFor="profile-name">YOUR NAME</label><input id="profile-name" value={form.name} onChange={event => change('name', event.target.value)} maxLength={50} /><label htmlFor="profile-interests">THINGS YOU’RE INTO</label><input id="profile-interests" value={form.interestsText} onChange={event => change('interestsText', event.target.value)} placeholder="Design, music, nature…" /><div className="profile-select-grid"><div><label htmlFor="profile-level">YOUR STARTING POINT</label><select id="profile-level" value={form.level} onChange={event => change('level', event.target.value)}><option value="beginner">Just getting started</option><option value="intermediate">Know a little already</option><option value="advanced">Ready to go deeper</option></select></div><div><label htmlFor="profile-style">HOW YOU LIKE TO LEARN</label><select id="profile-style" value={form.learningStyle} onChange={event => change('learningStyle', event.target.value)}><option value="hands-on">By trying things</option><option value="visual">By seeing it</option><option value="reading">By reading</option><option value="listening">By listening</option></select></div></div><label htmlFor="profile-goal">DAILY LEARNING GOAL <span>{form.dailyGoal} minutes</span></label><input id="profile-goal" type="range" min="5" max="60" step="5" value={form.dailyGoal} onChange={event => change('dailyGoal', event.target.value)} className="range-input" />{error && <p className="form-error">{error}</p>}<button className="primary-button modal-submit" type="submit" disabled={busy}>{busy ? <LoaderCircle className="spin" size={17} /> : <Check size={16} />}{busy ? 'Saving…' : 'Save my preferences'}</button></form></section></div>
}
