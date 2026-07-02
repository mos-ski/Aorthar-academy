import { describe, expect, it } from 'vitest';
import { getEventAccessState } from '@/lib/events/status';

describe('getEventAccessState', () => {
  const scheduledAt = '2026-07-02T10:00:00.000Z';

  it('keeps registration open before the live join window', () => {
    expect(getEventAccessState({
      scheduledAt,
      durationMinutes: 60,
      now: new Date('2026-07-02T06:59:59.000Z'),
      hasJoinUrl: true,
    })).toBe('registration');
  });

  it('shows the live class state during the join window and scheduled duration', () => {
    expect(getEventAccessState({
      scheduledAt,
      durationMinutes: 60,
      now: new Date('2026-07-02T07:00:00.000Z'),
      hasJoinUrl: true,
    })).toBe('live');

    expect(getEventAccessState({
      scheduledAt,
      durationMinutes: 60,
      now: new Date('2026-07-02T10:45:00.000Z'),
      hasJoinUrl: true,
    })).toBe('live');
  });

  it('shows the replay state after the class duration ends', () => {
    expect(getEventAccessState({
      scheduledAt,
      durationMinutes: 60,
      now: new Date('2026-07-02T11:00:00.000Z'),
      hasJoinUrl: true,
    })).toBe('replay');
  });
});
