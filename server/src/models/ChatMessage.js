import mongoose from 'mongoose'

const chatMessageSchema = new mongoose.Schema({
  learnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Learner', required: true, index: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
}, { timestamps: true })

export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema)
