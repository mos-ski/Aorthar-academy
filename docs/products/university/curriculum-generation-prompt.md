# Aorthar University — Curriculum Generation Prompt

Use this prompt for each department. Replace `[DEPARTMENT]` with the department name.
Run one department at a time. Save each output as its own markdown file in:
`docs/products/university/curriculum/`

---

## THE PROMPT

Copy everything below this line and paste it to the AI:

---

You are building the complete curriculum for the **[DEPARTMENT]** department at **Aorthar Academy** — a product internship school in Nigeria that trains people to work on real product teams.

## Context

Aorthar trains students from zero to employable across 8 departments:
- Product Management
- Product Design
- Frontend Engineering
- Backend Engineering
- QA Engineering
- Scrum & Agile Ops
- Data & Analytics
- Growth & Operations

The university has 4 years (100–400). Each year has 2 semesters. Each semester has 5 courses.
- **Year 100** — Foundation: core concepts, mindset, tools
- **Year 200** — Application: frameworks, workflows, deliverables
- **Year 300** — Mastery: advanced techniques, cross-functional thinking, leadership
- **Year 400** — Industry: capstone, portfolio, mentorship, job-ready skills

## Your task

Generate the **complete 4-year curriculum** for the **[DEPARTMENT]** department.

For every course, provide ALL of the following:

```
**[CODE] — [Course Title]** *(3 Credits)*
*Description:* [2–3 sentence description of what the student will learn and why it matters for their career]

*Classes:*
1. [Class title] — [Specific YouTube URL]
2. [Class title] — [Specific YouTube URL]
3. [Class title] — [Specific YouTube URL]
4. [Class title] — [Specific YouTube URL]
5. [Class title] — [Specific YouTube URL]

*AI Summary:* [2–3 sentence summary of the key takeaway a student should have after completing this course]

*Related Articles:*
- [Article title]: [URL]
- [Article title]: [URL]
- [Article title]: [URL]

*Quiz (5 questions):*
1. [Question] — **Answer:** [Answer]
2. [Question] — **Answer:** [Answer]
3. [Question] — **Answer:** [Answer]
4. [Question] — **Answer:** [Answer]
5. [Question] — **Answer:** [Answer]
```

## Rules

1. **YouTube links must be real, working, publicly available videos** — not invented. Search your training data carefully. If you are not certain a URL is real, write `[FIND: search term to use]` instead.
2. **Article links must be real** — MDN, web.dev, Nielsen Norman, Smashing Magazine, CSS-Tricks, freeCodeCamp, HackerNoon, etc. Use the same rule: if not certain, write `[FIND: search term]`.
3. Course codes follow this pattern: use the department abbreviation + year digit + sequence number. Examples: `PM101`, `DES203`, `FE301`, `BE402`, `QA102`, `SO201`, `DA301`, `GO102`.
4. Year 400 Semester 2 must include a **Capstone Project** course as the final course.
5. The curriculum should feel real — like something a working professional would recognise as high-quality training.
6. Do not repeat courses across years. Each year should build on the last.
7. Nigerian context where relevant (industry examples, tools widely used in Nigerian tech companies).

## Output format

Use this exact markdown structure:

```markdown
# [Department Name] Curriculum

**Status:** Complete
**Last Updated:** 2026-04-04

---

## YEAR 100 — [Foundation Theme Name]

**Goal:** [One sentence: what the student can do after Year 100]

### Semester 1

[5 courses with full details as above]

### Semester 2

[5 courses with full details as above]

---

## YEAR 200 — [Application Theme Name]

**Goal:** [One sentence]

### Semester 1
...

### Semester 2
...

---

## YEAR 300 — [Mastery Theme Name]
...

---

## YEAR 400 — [Industry Theme Name]
...
```

## Departments to generate (pick one per run)

Run this prompt separately for each of the following. The ones marked ✅ already have a draft — skip those unless told to redo them.

| Department | File to save to | Status |
|---|---|---|
| Product Management | `product-management.md` | needs YouTube links + classes + quiz + AI summary + articles |
| Product Design | `product-design.md` | needs YouTube links + classes + quiz + AI summary + articles |
| Frontend Engineering | `frontend.md` | needs YouTube links + classes + quiz + AI summary + articles |
| Backend Engineering | `backend.md` | has class titles, needs YouTube links + quiz + AI summary + articles |
| QA Engineering | `qa.md` | needs YouTube links + classes + quiz + AI summary + articles |
| Scrum & Agile Ops | `scrum.md` | needs YouTube links + classes + quiz + AI summary + articles |
| Data & Analytics | `operations.md` | needs YouTube links + classes + quiz + AI summary + articles |
| Growth & Operations | `growth.md` | needs to be created from scratch |

---

## HOW TO USE

1. Copy the prompt above
2. Replace `[DEPARTMENT]` with the department name (e.g. "Product Management")
3. Paste into Claude, ChatGPT, or Gemini
4. When the output comes back, scan for any `[FIND: ...]` placeholders — those need real URLs before the file is usable
5. Save the output to the correct `.md` file in `docs/products/university/curriculum/`
6. Repeat for each department

## TIPS

- Run one department per session — curriculum is long and context fills up fast
- Ask the AI to do one year at a time if it runs out of space
- After each file is done, verify at least 3–5 YouTube URLs actually exist before importing to the database
- The backend.md already has course titles and class lists — tell the AI to fill in the missing pieces rather than regenerating the whole thing
