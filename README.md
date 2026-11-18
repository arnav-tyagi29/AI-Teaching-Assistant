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
OPENROUTER_API_KEY=your-openrouter-key
OPENROUTER_MODEL=openrouter/free
# Optional OpenAI fallback
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

MongoDB is optional for the demo. If it is unavailable, the API uses the included in-memory learner and chat history. Add an OpenRouter key to enable model-backed tutor replies. The default `openrouter/free` model router selects an available free model; set `OPENROUTER_MODEL` to any model ID from OpenRouter to choose one yourself. OpenAI remains supported as a fallback. Without either key, the tutor uses its built-in demo coach. Provider keys stay on the server and are never sent to the browser.

## Build and run the API

```bash
npm run build
npm start
```

`npm start` serves the API on port 5000. For local development, `npm run dev` starts both workspaces with file watching and the Vite `/api` proxy.

## Deploy to Render

The root `render.yaml` defines a free Render web service. The Express server serves the Vite production build from the same origin, and `/api/health` is used for health checks. To deploy, push `main` to GitHub, create a new Blueprint in Render, and select this repository. Enter the OpenRouter key when Render prompts for `OPENROUTER_API_KEY`; the key is intentionally not stored in this repository.

Without `MONGO_URI`, the hosted app uses demo in-memory storage, so learner progress and chat history can reset when the service restarts. For persistent data, add a MongoDB Atlas connection string as `MONGO_URI` in the Render service environment. Render's free web service sleeps after 15 minutes without traffic, so its first request after idle can take about a minute to wake.

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
- **OpenRouter Chat Completions API** for optional model-backed tutoring, with OpenAI as a fallback
