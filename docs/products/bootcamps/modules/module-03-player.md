# Module 03: Lesson Player

## Overview

The learning interface where users watch videos and read lesson notes.

## Routes

| Route | Method | Description |
|-------|--------|-------------|
| `GET /courses-app/[courseId]/player` | GET | Lesson player page |
| `GET /courses-app/[courseId]/player?lesson=[lessonId]` | GET | Specific lesson |

## Layout

- Left sidebar: Lesson list with completion checkboxes
- Main area: YouTube video embed + Markdown notes
- Bottom: Previous/Next navigation + "Mark as Complete" button

## Requirements

- Only accessible if user has purchased the bootcamp
- YouTube video embedded via iframe
- Markdown notes rendered below the video
- "Mark as Complete" button toggles completion status
- Progress saved to `standalone_lesson_progress` table
- Keyboard shortcuts: Arrow keys for prev/next lesson
- Mobile: Sidebar collapses to a dropdown

## Data Requirements

- Verify `standalone_purchases` exists for user + course
- Fetch all lessons + user's progress
- On "Mark as Complete" → upsert into `standalone_lesson_progress`

## See Also

- [Detail Module](./module-02-detail.md)
- [Progress Module](./module-05-progress.md)
