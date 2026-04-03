# Module 05: Progress & Certificate

## Overview

Tracks lesson completion and generates a certificate when all lessons are complete.

## Routes

| Route | Method | Description |
|-------|--------|-------------|
| `GET /courses-app/[courseId]/certificate` | GET | Certificate download page |
| `POST /api/standalone/certificate/generate` | POST | Generate certificate PDF |

## Progress Tracking

- Each lesson has a "Mark as Complete" button in the player
- Completion stored in `standalone_lesson_progress`
- Progress percentage = (completed / total) × 100
- Displayed on the bootcamp detail page and player sidebar

## Certificate Generation

When all lessons are complete:

1. "Download Certificate" button appears on the detail page
2. Clicking generates a PDF certificate with:
   - Learner's name
   - Bootcamp title
   - Completion date
   - Aorthar branding
3. Certificate stored in Supabase Storage
4. URL saved to user's record for future downloads

## Requirements

- Certificate only available when 100% complete
- Certificate is downloadable anytime after generation
- PDF format with professional design

## Data Requirements

- Query `standalone_lesson_progress` for completion count
- Generate PDF server-side (can use `@react-pdf/renderer` or similar)
- Store in Supabase Storage bucket `certificates`

## See Also

- [Player Module](./module-03-player.md)
