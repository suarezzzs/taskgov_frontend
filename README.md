Aqui está o código Markdown pronto para copiar e colar no seu arquivo `README.md`:

```markdown
# Task Gov System - Frontend Client

A modern, responsive web interface for the Task Gov System, designed for corporate task management. This application provides a seamless user experience for managing workspaces, teams, and complex task lifecycles.

Built with **Next.js 15 (App Router)**, **TypeScript**, and **Shadcn/UI**.

## 🚀 Features

- **Modern UI/UX**
  - Clean, professional design using **Tailwind CSS**.
  - Interactive components (Dialogs, Tabs, Dropdowns) powered by **Shadcn/UI**.
  - Fully responsive layout for desktop and mobile.

- **Workspace Management**
  - Create and switch between multiple workspaces.
  - Invite members via email.
  - Manage team permissions and remove members.

- **Task Operations**
  - **Task Details Modal**: Comprehensive view with tabs for Overview, Checklists, Files, and Activity.
  - **Checklists**: Interactive to-do lists within tasks with real-time progress.
  - **File Management**: Upload and download attachments directly from the task view.
  - **Activity Log**: Visual timeline of all actions performed on a task.

- **Authentication**
  - Secure Login and Registration pages.
  - JWT token handling via Cookies for session management.

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Shadcn/UI](https://ui.shadcn.com/) (based on Radix UI)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Notifications:** [Sonner](https://sonner.emilkowal.ski/)
- **HTTP Client:** Native Fetch API

## ⚙️ Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- The **Backend API** running (usually on port 3000)

## 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/task-gov-frontend.git](https://github.com/your-username/task-gov-frontend.git)
   cd task-gov-frontend

```

2. **Install dependencies:**
```bash
npm install

```


3. **Environment Configuration (Optional):**
Create a `.env.local` file in the root directory to define the API URL:
```ini
NEXT_PUBLIC_API_URL=http://localhost:3000

```


*Note: If not configured, the app defaults to localhost:3000.*

## 🚀 Running the Application

1. **Start the Development Server:**
```bash
npm run dev

```


2. **Access the App:**
Open [http://localhost:3001](https://www.google.com/search?q=http://localhost:3001) in your browser.
*(Note: If the backend is running on port 3000, Next.js automatically switches to 3001).*

## 📂 Project Structure

```bash
src/
├── app/
│   ├── (auth)/        # Login and Register pages
│   ├── dashboard/     # Main protected application area
│   │   ├── workspace/ # Workspace details and task lists
│   │   └── layout.tsx # Sidebar and common layout
│   └── page.tsx       # Root redirect logic
├── components/
│   ├── ui/            # Reusable Shadcn/UI components (Button, Card, Input...)
│   └── ...
├── lib/               # Utilities (utils.ts)
└── styles/            # Global styles (globals.css)

```

## 🎨 UI Overview

The interface is built with a focus on **Radix UI** primitives for accessibility and **Tailwind CSS** for rapid styling. The main layout consists of a collapsible Sidebar and a dynamic content area.

## 🤝 Contributing

1. Fork the project.
2. Create your Feature Branch (`git checkout -b feature/NewUI`).
3. Commit your changes (`git commit -m 'Add new dashboard widget'`).
4. Push to the Branch (`git push origin feature/NewUI`).
5. Open a Pull Request.


```

```
