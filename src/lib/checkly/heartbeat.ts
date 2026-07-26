const HEARTBEAT_URLS = {
  'repair-links': process.env.CHECKLY_REPAIR_LINKS_HEARTBEAT_URL,
  'webinar-reminders': process.env.CHECKLY_WEBINAR_REMINDERS_HEARTBEAT_URL,
  'payment-plan-deadlines': process.env.CHECKLY_PAYMENT_PLAN_DEADLINES_HEARTBEAT_URL,
  'send-exam-links': process.env.CHECKLY_SEND_EXAM_LINKS_HEARTBEAT_URL,
} as const;

type CronJobName = keyof typeof HEARTBEAT_URLS;

export async function pingHeartbeat(cronJobName: CronJobName): Promise<void> {
  const url = HEARTBEAT_URLS[cronJobName];

  if (!url) {
    return;
  }

  try {
    await fetch(url, { method: 'GET', cache: 'no-store' });
  } catch (error) {
    console.error(`Failed to ping Checkly heartbeat for ${cronJobName}:`, error);
  }
}
