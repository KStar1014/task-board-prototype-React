# React Task Board Assessment

A production-ready task management application built with React, TypeScript, and Material-UI. Inspired by Jira and Trello, featuring drag-and-drop, file attachments, and comprehensive accessibility support.

🔗 **Live Demo**: [https://task-board-snowy-glitter-6111.fly.dev](https://task-board-snowy-glitter-6111.fly.dev)

---

## Quick Start

```bash
# Install dependencies
yarn install

# Start development server
yarn start

# Run tests
yarn test
```

The application will be available at [http://localhost:3000](http://localhost:3000)

---

## Overview

This project is a task management application built with React 18, TypeScript, and React Router. The application is inspired by tools such as Jira, Trello, and Basecamp and focuses on advanced interaction patterns, scalable state management, accessibility, and comprehensive test coverage.

The implementation intentionally goes beyond the minimum requirements to demonstrate production-ready React design, extensibility, and thoughtful tradeoffs.

---

## Features Implemented

### Task Management
- Create, edit, and delete tasks
- Task fields:
  - Title
  - Description
  - Deadline
  - Favorite flag
- Drill down task details view
- Attach multiple image files to tasks with preview support

### Board and Workflow
- Fully configurable columns
  - Create, rename, delete columns
  - Reorder columns
- Tasks belong to dynamic columns via column IDs
- Tasks persist across reloads using LocalStorage

### Drag and Drop
- Drag tasks between columns
- Reorder tasks within a column
- Reorder columns on the board
- Drag and drop state respects existing sorting and priority rules
- Keyboard accessible drag and drop interactions

### Sorting and Priority Rules
- Favorited tasks are always pinned to the top of each column
- Manual ordering supported within favorite and non-favorite groups
- Alphabetical sorting by task title used as a fallback
- Sorting is applied independently per column
- Sorting updates immediately after edits, moves, or favorite changes

### State Management
- **Context API** with `TaskBoardContext` for global state
- **Custom hooks** (`useBoardState`, `useLocalStorage`) for logic encapsulation
- Centralized state management without Redux complexity
- Automatic persistence to LocalStorage on state changes

### Accessibility
- Full keyboard navigation support
- ARIA roles and labels for interactive elements
- Visible focus indicators
- Screen reader-friendly drag and drop announcements

---

## Technical Stack

- **React 18** with Hooks API
- **React Router 6** for navigation
- **Material-UI (MUI) 5** for UI components
- **@dnd-kit** for accessible drag and drop
- **TypeScript** for type safety
- **Jest** and **React Testing Library** for testing
- **LocalStorage** for data persistence
- **date-fns** for date formatting
- **Yarn** as the package manager

---

## Project Structure

```
src/
├── components/
│   ├── Board.tsx
│   ├── Board.test.tsx
│   ├── Column.tsx
│   ├── Column.test.tsx
│   ├── ColumnForm.tsx
│   ├── ColumnForm.test.tsx
│   ├── ConfirmDialog.tsx
│   ├── ConfirmDialog.test.tsx
│   ├── TaskCard.tsx
│   ├── TaskCard.test.tsx
│   ├── TaskForm.tsx
│   ├── TaskForm.test.tsx
│   └── TaskDetails.tsx
├── context/
│   └── TaskBoardContext.tsx
├── hooks/
│   ├── useBoardState.ts
│   ├── useLocalStorage.ts
│   └── useLocalStorage.test.ts
├── dnd/
│   └── dragConfig.tsx
├── pages/
│   └── TaskDetailsPage.tsx
├── routes/
│   └── AppRoutes.tsx
├── types/
│   ├── Task.ts
│   ├── Column.ts
│   └── Attachment.ts
├── App.tsx
├── index.tsx
├── index.css
├── setupTests.ts
└── test-utils.tsx
```

---

## Data Models

### Column

```typescript
interface Column {
  id: string;
  name: string;
  order: number;
}
```

### Task

```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  favorite: boolean;
  columnId: string;
  order: number;
  attachments: Attachment[];
}
```

### Attachment

```typescript
interface Attachment {
  id: string;
  name: string;
  type: string;
  data: string; // Base64 encoded image data
}
```

All entities are persisted in LocalStorage.

---

## Drag and Drop Behavior

- Columns and tasks are draggable using **@dnd-kit**
- Dragging updates order values explicitly
- Sorting rules are re-applied after drag events
- Keyboard users can move tasks and columns using accessible controls
- Drag handles and visual feedback for better UX

---

## Persistence Strategy

- All board state is stored in LocalStorage
- State is serialized and restored on application load
- Storage size limits are respected for attachments
- Persistence logic is isolated from UI components

---

## Testing Strategy

The project uses **Jest** and **React Testing Library** with a user-focused approach.

### Test Files
- `Board.test.tsx` - Board component and overall functionality
- `Column.test.tsx` - Column component behavior
- `ColumnForm.test.tsx` - Column creation and editing
- `ConfirmDialog.test.tsx` - Confirmation dialog interactions
- `TaskCard.test.tsx` - Task card display and interactions
- `TaskForm.test.tsx` - Task creation and editing forms
- `useLocalStorage.test.ts` - LocalStorage hook functionality

### Covered Scenarios
- Create, edit, delete tasks
- Column creation, deletion, and reordering
- Drag tasks across columns
- Keyboard-based drag interactions
- Favorite task sorting priority
- Manual ordering within columns
- Attachment upload and preview
- LocalStorage persistence across reloads
- Form validation and error handling
- Confirmation dialogs

Tests interact with the UI and avoid implementation detail coupling.

---

## Running the Project

### Install Dependencies
```bash
yarn install
```

### Start Development Server
```bash
yarn start
```

The application will be available at:
http://localhost:3000

---

## Running Tests

### Run all tests
```bash
yarn test
```

### Run tests in watch mode
```bash
yarn test:watch
```

---

## Deployment to Fly.io

This application is deployed to Fly.io and can be accessed at: `https://task-board-snowy-glitter-6111.fly.dev`

### Prerequisites

1. **Install Fly CLI**
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex

   # macOS/Linux
   curl -L https://fly.io/install.sh | sh
   ```

2. **Sign up / Login to Fly.io**
   ```bash
   fly auth signup
   # or
   fly auth login
   ```

### Deploy Steps

1. **Launch the app (first time only)**
   ```bash
   fly launch --no-deploy
   ```

   When prompted:
   - App name: Press Enter to use auto-generated name or choose your own
   - Region: Choose the region closest to you (current: yyz - Toronto)
   - PostgreSQL/Redis: Select "No" for both
   - Deploy now: Select "No"

2. **Deploy the application**
   ```bash
   fly deploy
   ```

3. **Open your deployed app**
   ```bash
   fly open
   ```

Your app will be available at: `https://your-app-name.fly.dev`

### Deployment Features

- ✅ **Free tier compatible** - Auto-scales to 0 when not in use
- ✅ **HTTPS enabled** by default with force HTTPS
- ✅ **Multi-stage Docker build** - Optimized production image (~25MB)
- ✅ **Nginx Alpine server** - Fast static file serving with caching
- ✅ **React Router support** - All routes work correctly with SPA fallback
- ✅ **Auto start/stop machines** - Efficient resource usage
- ✅ **Shared CPU 1x** - Minimal resource footprint

### Useful Commands

```bash
# View application status
fly status

# View logs
fly logs

# Scale memory
fly scale memory 512

# Destroy the app
fly apps destroy task-board-snowy-glitter-6111
```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## Design Decisions and Tradeoffs

### State Management
- **Context API + Custom Hooks** instead of Redux to reduce boilerplate
- `TaskBoardContext` provides centralized state management
- `useBoardState` hook encapsulates all business logic
- `useLocalStorage` hook handles persistence layer

### Drag and Drop
- **@dnd-kit** selected for superior accessibility and maintainability
- Keyboard navigation support built-in
- Screen reader announcements for drag operations

### Data Persistence
- **LocalStorage** for client-side persistence (no backend required)
- Attachments stored as Base64 to avoid external dependencies
- Size limits respected to prevent storage quota issues

### Architecture
- **Co-located tests** with components for better maintainability
- **TypeScript** for type safety and better developer experience
- Sorting logic is deterministic and centralized
- Feature scope prioritized correctness and testability

---

## Known Limitations

- **LocalStorage size limits** restrict large file attachments (typically 5-10MB)
- **No multi-user support** or real-time collaboration
- **No backend persistence** - data is stored locally in browser
- **No authentication** or user management
- **Image attachments only** - other file types not supported

---

## Future Improvements

- **Backend integration** for multi-user collaboration
- **Authentication and authorization** with role-based access control
- **Real-time updates** using WebSockets
- **Advanced search and filtering** capabilities
- **Performance optimizations** for large boards (virtualization)
- **Mobile responsive design** improvements
- **Dark mode** support
- **Export/Import** board data (JSON format)
- **Task dependencies** and relationships
- **Activity history** and audit logs

---

## Configuration Files

- **package.json** - Dependencies and scripts
- **tsconfig.json** - TypeScript configuration
- **Dockerfile** - Multi-stage Docker build
- **nginx.conf** - Nginx server configuration
- **fly.toml** - Fly.io deployment configuration
- **.dockerignore** - Docker build exclusions

---

## Author

Lucas Carvalho
