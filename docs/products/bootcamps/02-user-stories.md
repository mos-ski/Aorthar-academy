# Bootcamps Product — User Stories

**Last Updated:** 2026-04-03

---

## Learner Stories

| ID | Story | Priority |
|---|---|---|
| BC-L01 | As a learner, I want to browse available bootcamps so that I can find one that matches my learning goal | High |
| BC-L02 | As a learner, I want to view a bootcamp's details (lessons, price, description) so that I can decide whether to buy it | High |
| BC-L03 | As a learner, I want to purchase a bootcamp via Paystack so that I can get permanent access | High |
| BC-L04 | As a learner, I want to watch lesson videos and read notes so that I can learn the content | High |
| BC-L05 | As a learner, I want to mark lessons as complete so that I can track my progress | High |
| BC-L06 | As a learner, I want to see my overall progress in a bootcamp so that I know how much is left | Medium |
| BC-L07 | As a learner, I want to receive a certificate when I complete all lessons so that I can showcase my achievement | Medium |

---

### BC-L01 — Browse Bootcamps

| Field | Detail |
|-------|--------|
| **ID** | BC-L01 |
| **Role** | Learner |
| **Story** | As a learner, I want to browse available bootcamps so that I can find one that matches my learning goal. |
| **Route** | `courses.aorthar.com/` |

| # | Given | When | Then |
|---|-------|------|------|
| 1 | I visit the bootcamp catalog | — | I see a grid of published bootcamps with title, thumbnail, price, and lesson count |
| 2 | No bootcamps are published | — | I see a "No bootcamps available" message |

---

### BC-L02 — View Bootcamp Details

| Field | Detail |
|-------|--------|
| **ID** | BC-L02 |
| **Role** | Learner |
| **Story** | As a learner, I want to view a bootcamp's details so that I can decide whether to buy it. |
| **Route** | `courses.aorthar.com/courses-app/[courseId]` |

| # | Given | When | Then |
|---|-------|------|------|
| 1 | I click on a bootcamp | — | I see the title, description, thumbnail, price, lesson count, and a "Buy Now" button |
| 2 | I am viewing the lesson list | — | I see each lesson's title and estimated duration |
| 3 | I have already purchased this bootcamp | — | The "Buy Now" button is replaced with "Continue Learning" |

---

### BC-L03 — Purchase Bootcamp

| Field | Detail |
|-------|--------|
| **ID** | BC-L03 |
| **Role** | Learner |
| **Story** | As a learner, I want to purchase a bootcamp via Paystack so that I can get permanent access. |
| **Route** | `courses.aorthar.com/courses-app/[courseId]/checkout` |

| # | Given | When | Then |
|---|-------|------|------|
| 1 | I click "Buy Now" | — | I am redirected to Paystack checkout |
| 2 | My payment is successful | — | I receive confirmation and am redirected to the lesson player |
| 3 | My payment fails | — | I see an error and can retry |
| 4 | I am not logged in | I click "Buy Now" | I am prompted to sign up or log in before checkout |

---

### BC-L04 — Watch Lessons

| Field | Detail |
|-------|--------|
| **ID** | BC-L04 |
| **Role** | Learner |
| **Story** | As a learner, I want to watch lesson videos and read notes so that I can learn the content. |
| **Route** | `courses.aorthar.com/courses-app/[courseId]/player` |

| # | Given | When | Then |
|---|-------|------|------|
| 1 | I have purchased a bootcamp | I click "Continue Learning" | I see the lesson player with the video and lesson notes |
| 2 | A lesson has a YouTube video | — | The video is embedded and playable |
| 3 | A lesson has Markdown notes | — | The notes are rendered and readable |
| 4 | I navigate between lessons | — | I can go to the previous or next lesson using navigation buttons |

---

### BC-L05 — Mark Lessons Complete

| Field | Detail |
|-------|--------|
| **ID** | BC-L05 |
| **Role** | Learner |
| **Story** | As a learner, I want to mark lessons as complete so that I can track my progress. |
| **Route** | `courses.aorthar.com/courses-app/[courseId]/player` |

| # | Given | When | Then |
|---|-------|------|------|
| 1 | I am viewing a lesson | I click "Mark as Complete" | The lesson is marked complete and the next lesson is suggested |
| 2 | A lesson is already complete | — | The "Mark as Complete" button shows "Completed" |

---

### BC-L06 — View Progress

| Field | Detail |
|-------|--------|
| **ID** | BC-L06 |
| **Role** | Learner |
| **Story** | As a learner, I want to see my overall progress in a bootcamp so that I know how much is left. |
| **Route** | `courses.aorthar.com/courses-app/[courseId]` |

| # | Given | When | Then |
|---|-------|------|------|
| 1 | I have purchased a bootcamp | I view the detail page | I see a progress bar showing completed vs total lessons |
| 2 | I have completed 3 of 10 lessons | — | The progress bar shows 30% |

---

### BC-L07 — Receive Certificate

| Field | Detail |
|-------|--------|
| **ID** | BC-L07 |
| **Role** | Learner |
| **Story** | As a learner, I want to receive a certificate when I complete all lessons so that I can showcase my achievement. |
| **Route** | Bootcamp detail page |

| # | Given | When | Then |
|---|-------|------|------|
| 1 | I have completed all lessons | — | A "Download Certificate" button appears |
| 2 | I click "Download Certificate" | — | A PDF certificate is generated and downloaded |

---

## Admin Stories

| ID | Story | Priority |
|---|---|---|
| BC-AD01 | As an admin, I want to create bootcamps so that I can offer new learning products | High |
| BC-AD02 | As an admin, I want to add lessons to a bootcamp so that I can structure the content | High |
| BC-AD03 | As an admin, I want to edit lesson content (video, notes) so that I can update or fix content | High |
| BC-AD04 | As an admin, I want to set bootcamp pricing so that I can control revenue | Medium |
| BC-AD05 | As an admin, I want to view purchase history so that I can track revenue | Medium |

---

### BC-AD01 — Create Bootcamp

| Field | Detail |
|-------|--------|
| **ID** | BC-AD01 |
| **Role** | Admin |
| **Story** | As an admin, I want to create bootcamps so that I can offer new learning products. |
| **Route** | `/admin/bootcamps` |

| # | Given | When | Then |
|---|-------|------|------|
| 1 | I am on the bootcamp management page | I click "+ New Bootcamp" | A form opens for title, description, price, and thumbnail |
| 2 | I fill in the required fields | I click "Create" | The bootcamp is created in draft status |
| 3 | I publish the bootcamp | I click "Publish" | The bootcamp appears on the public catalog |

---

### BC-AD02 — Add Lessons

| Field | Detail |
|-------|--------|
| **ID** | BC-AD02 |
| **Role** | Admin |
| **Story** | As an admin, I want to add lessons to a bootcamp so that I can structure the content. |
| **Route** | `/admin/bootcamps/[id]` |

| # | Given | When | Then |
|---|-------|------|------|
| 1 | I am on a bootcamp's detail page | I click "+ Add Lesson" | A form opens for title, video URL, content, and duration |
| 2 | I fill in the lesson details | I click "Save" | The lesson is added with the correct sort order |

---

### BC-AD03 — Edit Lessons

| Field | Detail |
|-------|--------|
| **ID** | BC-AD03 |
| **Role** | Admin |
| **Story** | As an admin, I want to edit lesson content so that I can update or fix content. |
| **Route** | `/admin/bootcamps/[id]` |

| # | Given | When | Then |
|---|-------|------|------|
| 1 | A lesson exists | I click the edit icon | An inline edit form opens with current values |
| 2 | I update the video URL | I save | The lesson's video is updated |

---

### BC-AD04 — Set Pricing

| Field | Detail |
|-------|--------|
| **ID** | BC-AD04 |
| **Role** | Admin |
| **Story** | As an admin, I want to set bootcamp pricing so that I can control revenue. |
| **Route** | `/admin/bootcamps/[id]` |

| # | Given | When | Then |
|---|-------|------|------|
| 1 | I am editing a bootcamp | I change the price and save | The new price is reflected on the public page |

---

### BC-AD05 — View Purchases

| Field | Detail |
|-------|--------|
| **ID** | BC-AD05 |
| **Role** | Admin |
| **Story** | As an admin, I want to view purchase history so that I can track revenue. |
| **Route** | `/admin/bootcamps/purchases` |

| # | Given | When | Then |
|---|-------|------|------|
| 1 | I view the purchases page | — | I see a table of all purchases with user, bootcamp, amount, and date |

---

## See Also

- [Bootcamps Overview](./00-overview.md)
- [Shared Payments](../_shared/03-payments.md)
