# Morrow — a personal learning agent

Morrow is a MERN learning companion that shapes a learning path around a learner’s goals, interests, level, preferred learning style, and daily study time. It includes a progress dashboard, short lesson activities, learner preferences, and a conversational tutor.

## Run locally

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

The Vite app runs at `http://localhost:5173` and the Express API runs at `http://localhost:5000`. The app starts with sample learner data and keeps changes in memory when MongoDB is not configured.

## Use MongoDB and an AI provider

Copy `server/.env.example` to `server/.env`, then set the values you want to use:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/morrow
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

MongoDB is optional for the demo. If it is unavailable, the API uses the included in-memory learner and chat history. Add an OpenAI API key to enable model-backed tutor replies; without one, the tutor uses its built-in demo coach. The key stays on the server and is never sent to the browser.

## Build and run the API

```bash
npm run build
npm start
```

`npm start` serves the API on port 5000. For local development, `npm run dev` starts both workspaces with file watching and the Vite `/api` proxy.

## Main API routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Check API and storage mode |
| `GET` | `/api/dashboard` | Load learner profile, active path, and study summary |
| `PATCH` | `/api/profile` | Save learning preferences |
| `POST` | `/api/plan` | Create a learning path for a goal |
| `PATCH` | `/api/lessons/:lessonId/complete` | Complete the current lesson and advance the path |
| `GET` | `/api/chat/history` | Load recent tutor conversation |
| `POST` | `/api/chat` | Ask the tutor a question |

## Stack

- **MongoDB / Mongoose** for learner profiles, paths, lessons, and chat messages
- **Express** for the REST API
- **React / Vite** for the responsive web app
- **OpenAI Chat Completions API** for optional model-backed tutoring
