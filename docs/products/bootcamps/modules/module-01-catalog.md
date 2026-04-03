# Module 01: Bootcamp Catalog

## Overview

The public-facing catalog where learners browse available bootcamps at `bootcamp.aorthar.com`.

## Routes

| Route | Method | Description |
|-------|--------|-------------|
| `GET /` | GET | Bootcamp catalog landing |
| `GET /courses-app` | GET | Catalog browse (same as /) |

## Layout

- Grid of published bootcamps (3 columns on desktop, 1 on mobile)
- Each card shows: thumbnail, title, price, lesson count, "View Details" link
- Sorted by `sort_order` ascending

## Requirements

- Only show `status = 'published'` bootcamps
- Mobile responsive
- Fast loading (< 2 seconds)

## Data Requirements

Fetch from `standalone_courses` where `status = 'published'`, ordered by `sort_order`.

## See Also

- [Detail Module](./module-02-detail.md)
