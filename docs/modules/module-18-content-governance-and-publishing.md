# Module 18: Content Governance and Publishing Workflow

## Purpose
Define how admin updates departments, topics, classes, and publishes safely to student app.

## Content Hierarchy
1. Faculty
2. Department/Discipline
3. Year (100/200/300/400)
4. Semester (1/2)
5. Course (e.g., `DES101`)
6. Weekly class/lesson
7. Resource/material (YouTube, article, document)
8. Assessment (quiz/exam questions)

## Recommended Admin Workflow
1. Draft
- Create/update course metadata (`status = draft`).
- Add lessons in order.
- Attach primary resources + material links.
- Create quiz/exam questions.

2. QA Validation
- Check all URLs are valid/playable/readable.
- Verify lesson ordering and weekly mapping.
- Validate pass mark, credits, attempt limits.

3. Publish
- Set course + lessons published.
- Trigger cache refresh/link-repair process.
- Confirm visibility in student catalog.

4. Monitor
- Watch completion, reactions, comments, quiz pass rate.
- Patch broken links and republish updates.

## Update Rules
- Minor update: title/text/link fixes, no ID changes.
- Major update: lesson reorder, resource replacement, new assessment version.
- Archive policy: move outdated courses to `archived`, never hard delete historical graded data.

## Release Checklist
- Department mapping confirmed.
- Week/topic/core concept/material table complete.
- At least one quiz set available.
- Accessibility/UX checks passed.
- Billing flags aligned (`is_premium`).
