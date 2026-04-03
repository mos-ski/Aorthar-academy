# Module 02: Bootcamp Detail

## Overview

Individual bootcamp page showing full details: description, lessons, pricing, and purchase CTA.

## Routes

| Route | Method | Description |
|-------|--------|-------------|
| `GET /courses-app/[courseId]` | GET | Bootcamp detail page |

## Content

- Hero: Title, thumbnail, price, "Buy Now" / "Continue Learning" button
- Description: Full Markdown description
- Lessons list: Each lesson's title, duration, and completion status (if purchased)
- Progress bar (if purchased)
- "Buy Now" → redirects to Paystack checkout
- "Continue Learning" → goes to lesson player (if already purchased)

## Requirements

- Show progress bar only for purchased bootcamps
- If all lessons complete → show "Download Certificate" button
- If not purchased → show lesson count but not full content
- If purchased → show full lesson list with completion checkboxes

## Data Requirements

Fetch `standalone_courses` by ID + all `standalone_lessons` where `is_published = true`, ordered by `sort_order`.

## See Also

- [Player Module](./module-03-player.md)
- [Purchase Module](./module-04-purchase.md)
