# 🌿 Mindspace

[![Project Status](https://img.shields.io/badge/status-active-success.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()

Mindspace is a gentle, joyful space to grow your thinking. It's like Obsidian meets Anki meets ChatGPT meets Calm/Headspace — a calming companion for learning, remembering, and integrating ideas into your life, and also a space to immerse yourself in your thoughts/feelings/insights.

Whether you're exploring a book, working through an idea, or building a new habit, Mindspace helps you:
- 🌱 Capture ideas in connected notes
- 🧠 Understand and retain them through spaced recall
- 🔄 Turn insights into real-life tasks or reminders

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

## 🤝 Contributing
We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📝 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
