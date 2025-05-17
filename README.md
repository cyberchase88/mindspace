# 🌿 Mindspace

[![Project Status](https://img.shields.io/badge/status-active-success.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()

---

## 🚀 Run Anywhere with Docker

Run Mindspace on their machine using Docker just following these steps:

1. **Install Docker**
   - Download and install Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/).

2. **Clone this repository**
   ```bash
   git clone <your-repo-url>
   cd mindspace
   ```

3. **Add a `.env` file**
   - Create a file named `.env` in the project root with the following variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     OPENAI_API_KEY=your_openai_key
     ```
   - (You can copy from `.env.example` if provided.)

4. **Build the Docker image**
   ```bash
   docker build -t mindspace .
   ```

5. **Run the Docker container**
   ```bash
   docker run --env-file .env -p 3000:3000 mindspace
   ```

6. **Open your browser**
   - Go to [http://localhost:3000](http://localhost:3000)

---

Mindspace is a gentle, joyful space to grow your thinking. It's like Obsidian meets Anki meets ChatGPT meets Calm/Headspace — a calming companion for learning, remembering, and integrating ideas into your life, and also a space to immerse yourself in your thoughts/feelings/insights.

Whether you're exploring a book, working through an idea, or building a new habit, Mindspace helps you:
- 🌱 Capture ideas in connected notes
- 🧠 Understand and retain them through strategies proven to accelerate learning(primarily, active recall and spaced repetition)
- 🔄 Take insights and truly integrate them into your life through real-life tasks or reminders

## 🌟 Why Mindspace?
Because you deserve a learning experience that's not just effective — but beautiful, meaningful, and playful too.

## 🛠 Tech Stack Details
- **Frontend**: 
  - React 18+ (JavaScript)
  - React Router for navigation
  - React Query for data fetching
  - Markdown editor with custom extensions
- **Styling**: 
  - Plain CSS with CSS Modules (No Tailwind CSS)
  - CSS Custom Properties for theming
  - Responsive design principles
  - SCSS support for advanced styling needs
- **Backend**: 
  - Supabase (PostgreSQL)
  - Supabase Storage for file attachments
  - Supabase Realtime for live updates
- **Development**:
  - Docker for containerization
  - Jest + React Testing Library
  - ESLint + Prettier
  - Husky for git hooks

## 🧪 Core Principles
- Support for Markdown note-taking
- Active Recall + Spaced Repetition (not just passive review)
- Inline Chat Assistant (like having GPT alongside you)
- Visual Zettelkasten-style link graph
- Calendar/task integration for real-life application

## 🚧 Phases of Build
**Phase 1: Thought Flow**  
Capture and reflect
- Note editor with Markdown
- AI Chat assistant (collapsible)
- Supabase-based storage
- "Remember this" toggle(for the active recall + spaced repetition features- AI will generate these questions)

**Phase 2: Memory Garden**  
- Review screen w/ spaced recall
- Link notes manually
- Auto-suggest related notes

**Phase 3: Bloom + Action**  
- Actionable tasks/habits from notes
- Calendar integration
- Graph visualization of Zettelkasten links

## 🐳 Run Locally
```bash
# with Node
npm install
npm run dev

# with Docker
docker build -t mindspace .
docker run -p 3000:3000 mindspace

```

## 📊 Project Status
- [x] Project initialization
- [ ] Phase 1: Thought Flow (In Progress)
- [ ] Phase 2: Memory Garden (Planned)
- [ ] Phase 3: Bloom + Action (Planned)


## This is a solo project.
## No features, documentation, or setup steps are required for collaborators or team onboarding.

## 🤝 Contributing
We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📝 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
