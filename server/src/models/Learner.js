import mongoose from 'mongoose'

const lessonSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  duration: { type: Number, default: 15 },
  type: { type: String, default: 'lesson' },
  status: { type: String, enum: ['completed', 'current', 'upcoming'], default: 'upcoming' },
  accent: { type: String, default: 'mint' },
})

const planSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  progress: { type: Number, default: 0 },
  lessons: { type: [lessonSchema], default: [] },
  updatedAt: { type: Date, default: Date.now },
}, { _id: false })

const learnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  avatar: { type: String, default: 'AM' },
  interests: { type: [String], default: [] },
  level: { type: String, default: 'beginner' },
  learningStyle: { type: String, default: 'hands-on' },
  dailyGoal: { type: Number, default: 25 },
  streak: { type: Number, default: 4 },
  completedMinutes: { type: Number, default: 185 },
  activePlan: { type: planSchema, required: true },
}, { timestamps: true })

export const Learner = mongoose.model('Learner', learnerSchema)
