# Module 16: Unauthorized / Access Guard

## Route
- `/unauthorized`

## Goal
- Show permission failure for blocked routes (especially admin).

## Trigger Conditions
- Non-admin hitting `/admin`.
- Role mismatch under middleware policies.

## Admin Ownership
- Role assignment process and escalation pathway.
