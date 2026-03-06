# ☸️ KubeQuest

**Interactive Kubernetes learning — quizzes, incident scenarios, leaderboard, and progress tracking.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-kubequest.online-00D4FF?style=flat-square&logo=vercel)](https://www.kubequest.online/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/or-carmeli/KubeQuest/ci.yml?branch=main&style=flat-square&label=build)](https://github.com/or-carmeli/KubeQuest/actions)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)

---

## Features

| | Feature |
|---|---------|
| 🧠 | **5 Topics** — Workloads, Networking, Config & Security, Storage & Helm, Troubleshooting |
| 📶 | **3 difficulty levels** per topic (Easy → Medium → Hard), progressively unlocked |
| 🚨 | **Incident Mode** — multi-step real-world Kubernetes failure scenarios with scoring |
| 🗺️ | **Roadmap view** — guided learning path through all topics and levels |
| 🎲 | **Mixed Quiz** — 10 random questions across all topics |
| 🔥 | **Daily Challenge** — 5 fresh questions every day |
| 🎯 | **Interview Mode** — mandatory timer, hints disabled, exam-style pressure |
| 📖 | **Kubernetes Guide** — cheatsheet for quick lookup while practicing |
| ↩️ | **Quiz resume** — continue where you left off after refresh or navigation |
| 🔁 | **History navigation** — review past answers and retry wrong ones |
| 📉 | **Weak Area card** — highlights your lowest-accuracy topic |
| 🏆 | **Leaderboard** with global top scores |
| 🏅 | **Achievements** system |
| 🌐 | **Hebrew / English** with full RTL support |
| 👤 | **Guest mode** (no registration) + full auth via Supabase |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | [React 18](https://react.dev) + [Vite 5](https://vitejs.dev) |
| Auth & Database | [Supabase](https://supabase.com) (PostgreSQL + Auth) |
| Hosting | [kubequest.online](https://www.kubequest.online/) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A free [Supabase](https://supabase.com) account _(optional — the app works in guest mode without it)_

### Installation

```bash
git clone https://github.com/or-carmeli/KubeQuest.git
cd KubeQuest
npm install
```

### Environment Variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

> The app runs fully in guest mode without Supabase credentials. Auth, leaderboard, and cross-device sync require a Supabase project.

### Run

```bash
npm run dev      # development server → http://localhost:5173
npm run build    # production build
npm run preview  # preview the production build locally
```

---

## Supabase Setup

Create a `user_stats` table with the following schema:

| Column | Type |
|--------|------|
| `user_id` | `uuid` — unique, references `auth.users` |
| `username` | `text` |
| `total_answered` | `int4` |
| `total_correct` | `int4` |
| `total_score` | `int4` |
| `max_streak` | `int4` |
| `current_streak` | `int4` |
| `completed_topics` | `jsonb` |
| `achievements` | `jsonb` |
| `topic_stats` | `jsonb` |
| `updated_at` | `timestamptz` |

Enable Row Level Security and add a policy:

```sql
create policy "Users can manage own stats"
on public.user_stats
for all
to public
using (auth.uid() = user_id);
```

---

## Project Structure

```
src/
  App.jsx              # Main application (UI + state)
  topics.js            # All quiz questions by topic and level
  incidents.js         # Incident Mode scenarios
  dailyQuestions.js    # Daily Challenge question pool
  components/
    RoadmapView.jsx
    WeakAreaCard.jsx
  utils/
    quizPersistence.js
```

---

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for how to get started, including how to add quiz questions.

---

## License

[MIT](LICENSE) © 2026 Or Carmeli
