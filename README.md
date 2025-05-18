# 🌿 Mindspace

[![Project Status](https://img.shields.io/badge/status-active-success.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()

---

## 🚀 Getting Started (Local Setup)

Run Mindspace on your machine by following these steps:

1. **Clone this repository**
   ```bash
   git clone https://github.com/cyberchase88/mindspace.git
   cd mindspace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Add a `.env` file**
   - Create a file named `.env` in the project root with the following variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     OPENAI_API_KEY=your_openai_key
     ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Go to [http://localhost:3000/notes](http://localhost:3000/notes)

---

## 🌟 Why Mindspace?
Because you’re not just learning — you’re building a relationship with your mind.
Mindspace helps you slow down, reflect, and remember — in a way that feels like you. No pressure. No noise. Just the right mix of structure and wonder, so what matters actually sticks.

This is a gentle, joyful space to grow your thinking. It's like Obsidian meets Anki meets ChatGPT meets Calm/Headspace — a calming companion for learning, remembering, and integrating ideas into your life, and also a space to immerse yourself in your thoughts/feelings/insights.

Whether you're exploring a book, working through an idea, or building a new habit, Mindspace helps you:
- 🌱 Capture ideas in connected notes
- 🧠 Understand and retain them through strategies proven to accelerate learning (e.g., active recall and spaced repetition)
- 🔄 Take insights and truly integrate them into your life through real-life tasks or reminders

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
  - Jest + React Testing Library
  - ESLint + Prettier
  - Husky for git hooks

## 🧪 Core Principles
- Support for Markdown note-taking
- Active Recall + Spaced Repetition (not just passive review)
- Inline Chat Assistant
- Visual Zettelkasten-style link graph
- Calendar/task integration for real-life application

## 🚧 Phases of Build
**Phase 1: Thought Flow**  
Capture and reflect
- Note editor with Markdown
- AI Chat assistant (collapsible)
- Supabase-based storage

**Phase 2: Memory Garden**
- "Remember this" toggle (for the active recall + spaced repetition features — AI will generate these questions)
- Review screen w/ spaced recall
- Link notes

**Phase 3: Visualization + Taking Action**  
- Actionable tasks/habits from notes
- Calendar integration
- Graph visualization of Zettelkasten links



## 🤝 Contributing
We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📝 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
