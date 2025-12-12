# React Task Board Assessment

## Overview

This project is a task management application built for the RamSoft React Developer Assessment. The application is inspired by tools such as Jira, Trello, and Basecamp and focuses on advanced interaction patterns, scalable state management, accessibility, and comprehensive test coverage.

The implementation intentionally goes beyond the minimum requirements to demonstrate production ready React design, extensibility, and thoughtful tradeoffs.

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
- Manual ordering supported within favorite and non favorite groups
- Alphabetical sorting by task title used as a fallback
- Sorting is applied independently per column
- Sorting updates immediately after edits, moves, or favorite changes

### Accessibility
- Full keyboard navigation support
- ARIA roles and labels for interactive elements
- Visible focus indicators
- Screen reader friendly drag and drop announcements

---

## Technical Stack

- React with Hooks API
- React Router
- Material UI
- @dnd-kit for drag and drop
- Jest
- React Testing Library
- LocalStorage for persistence
- Yarn as the package manager

---

## Project Structure

```
src/
├── components/
│   ├── Board.tsx
│   ├── Column.tsx
│   ├── TaskCard.tsx
│   ├── TaskForm.tsx
│   ├── TaskDetails.tsx
│   └── ColumnForm.tsx
├── hooks/
│   ├── useBoardState.ts
│   └── useLocalStorage.ts
├── dnd/
│   └── dragConfig.ts
├── routes/
│   └── AppRoutes.tsx
├── tests/
│   ├── Board.test.tsx
│   ├── DragAndDrop.test.tsx
│   ├── SortingRules.test.tsx
│   ├── Attachments.test.tsx
│   └── LocalStorage.test.tsx
├── types/
│   ├── Task.ts
│   ├── Column.ts
│   └── Attachment.ts
├── App.tsx
└── index.tsx
```

---

## Data Models

### Column

```
Column {
  id: string
  name: string
  order: number
}
```

### Task

```
Task {
  id: string
  title: string
  description: string
  deadline: string
  favorite: boolean
  columnId: string
  order: number
  attachments: Attachment[]
}
```

### Attachment

```
Attachment {
  id: string
  name: string
  type: string
  data: string
}
```

All entities are persisted in LocalStorage.

---

## Drag and Drop Behavior

- Columns and tasks are draggable using @dnd-kit
- Dragging updates order values explicitly
- Sorting rules are re applied after drag events
- Keyboard users can move tasks and columns using accessible controls

---

## Persistence Strategy

- All board state is stored in LocalStorage
- State is serialized and restored on application load
- Storage size limits are respected for attachments
- Persistence logic is isolated from UI components

---

## Testing Strategy

The project uses Jest and React Testing Library with a user focused approach.

### Covered Scenarios
- Create, edit, delete tasks
- Column creation, deletion, and reordering
- Drag tasks across columns
- Keyboard based drag interactions
- Favorite task sorting priority
- Manual ordering within columns
- Attachment upload and preview
- LocalStorage persistence across reloads

Tests interact with the UI and avoid implementation detail coupling.

---

## Running the Project

### Install Dependencies
```
yarn install
```

### Start Development Server
```
yarn start
```

The application will be available at:
http://localhost:3000

---

## Running Tests

```
yarn test
```

---

## Design Decisions and Tradeoffs

- Redux was intentionally avoided to reduce boilerplate and complexity
- @dnd-kit was selected for accessibility and maintainability
- Attachments are stored locally to avoid backend complexity
- Sorting logic is deterministic and centralized
- Feature scope prioritized correctness and testability

---

## Known Limitations

- LocalStorage size limits restrict large file attachments
- No multi user or authentication support
- No backend persistence

---

## Future Improvements

- Backend integration for collaboration
- Authentication and role based access
- Real time updates
- Advanced search and filtering
- Performance optimizations for large boards

---

## Author

Lucas Carvalho
