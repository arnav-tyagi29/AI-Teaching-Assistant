export const demoLearner = {
  _id: 'demo-learner',
  name: 'Alex Morgan',
  email: 'alex@morrow.local',
  avatar: 'AM',
  interests: ['Product design', 'Psychology', 'Sustainability'],
  level: 'beginner',
  learningStyle: 'hands-on',
  dailyGoal: 25,
  streak: 4,
  completedMinutes: 185,
  activePlan: {
    title: 'Product design foundations',
    subtitle: 'A hands-on path built around the way you learn',
    progress: 40,
    lessons: [
      { id: 'discover', title: 'Design thinking, made simple', description: 'Learn to notice the small moments that shape a great experience.', duration: 12, type: 'Read & reflect', status: 'completed', accent: 'mint' },
      { id: 'empathy', title: 'Get curious about people', description: 'Turn everyday observations into useful user insights.', duration: 18, type: 'Interactive', status: 'completed', accent: 'peach' },
      { id: 'personas', title: 'Sketch your first user persona', description: 'Build a tiny profile for a real person you want to help.', duration: 20, type: 'Mini project', status: 'current', accent: 'lavender' },
      { id: 'journeys', title: 'Map the moments that matter', description: 'See a product through someone else’s eyes.', duration: 15, type: 'Visual exercise', status: 'upcoming', accent: 'blue' },
      { id: 'prototype', title: 'Make an idea tangible', description: 'Create a quick prototype and learn from it.', duration: 25, type: 'Mini project', status: 'upcoming', accent: 'butter' },
    ],
    updatedAt: new Date().toISOString(),
  },
}

export const demoMessages = []

export function makePlan(goal, learner) {
  const cleanGoal = String(goal || 'Explore a new skill').trim().slice(0, 80)
  const topic = cleanGoal.toLowerCase()
  const template = [
    ['Start with the big picture', `Get a clear, friendly introduction to ${cleanGoal}.`, 'Read & reflect', 'mint'],
    ['Learn by noticing', `Spot how ${topic} shows up in the world around you.`, 'Interactive', 'peach'],
    ['Try a tiny experiment', `Put one idea about ${topic} into practice.`, 'Mini project', 'lavender'],
    ['Connect the dots', `Build a mental model that makes ${topic} easier to remember.`, 'Visual exercise', 'blue'],
    ['Make it your own', `Create something small with what you learned about ${topic}.`, 'Mini project', 'butter'],
  ]
  const lessons = template.map(([title, description, type, accent], index) => ({
    id: `lesson-${Date.now()}-${index}`,
    title,
    description,
    duration: [12, 16, 20, 15, 25][index],
    type,
    status: index === 0 ? 'current' : 'upcoming',
    accent,
  }))
  return {
    title: cleanGoal,
    subtitle: `A ${learner.learningStyle} path, paced for ${learner.dailyGoal} minutes a day`,
    progress: 0,
    lessons,
    updatedAt: new Date().toISOString(),
  }
}
