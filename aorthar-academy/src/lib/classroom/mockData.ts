export type MockComment = {
  id: string;
  body: string;
  user_id: string;
  parent_id: string | null;
  created_at: string;
  counts: { like: number; dislike: number };
  myReaction: 'like' | 'dislike' | null;
  replies: MockComment[];
};

const SAMPLE_NAMES = [
  'Aisha', 'Tunde', 'Ngozi', 'Samuel', 'Imani', 'Dayo', 'Kemi', 'Femi', 'Ada', 'Chidi',
  'Ruth', 'Bola', 'Ken', 'Zainab', 'Moses', 'Peace', 'Victor', 'Blessing', 'Mariam', 'Tosin',
];

const SAMPLE_BODIES = [
  'This class made the concept clearer than previous videos.',
  'I like the examples around real product workflows.',
  'Can anyone share how they applied this in a side project?',
  'The pacing was solid; I replayed week 3 twice.',
  'This helped me connect design and engineering better.',
  'Would love more case studies in the next lesson.',
  'The explanation on tradeoffs was very practical.',
  'I finally understand why this step matters in delivery.',
  'Great class. The summary points were super helpful.',
  'I used this to improve my current capstone module.',
];

export function buildSampleComments(lessonId: string): MockComment[] {
  const now = Date.now();
  return Array.from({ length: 20 }).map((_, i) => ({
    id: `sample-${lessonId}-${i + 1}`,
    body: SAMPLE_BODIES[i % SAMPLE_BODIES.length],
    user_id: `student-${SAMPLE_NAMES[i % SAMPLE_NAMES.length].toLowerCase()}`,
    parent_id: null,
    created_at: new Date(now - (20 - i) * 3600 * 1000).toISOString(),
    counts: { like: 2 + (i % 7), dislike: i % 3 },
    myReaction: null,
    replies: i % 4 === 0
      ? [{
        id: `sample-${lessonId}-${i + 1}-reply-1`,
        body: 'Same here, I also bookmarked this lesson for revision.',
        user_id: 'student-peer',
        parent_id: `sample-${lessonId}-${i + 1}`,
        created_at: new Date(now - (19 - i) * 3500 * 1000).toISOString(),
        counts: { like: 1, dislike: 0 },
        myReaction: null,
        replies: [],
      }]
      : [],
  }));
}

const STUDY_SUFFIXES = [
  'full course',
  'tutorial for beginners',
  'explained simply',
  'in practice',
  'tips and techniques',
  'step by step',
  'real world examples',
  'deep dive',
];

export function buildSampleRelatedVideos(lessonTitle: string) {
  return STUDY_SUFFIXES.map((suffix) => {
    const query = encodeURIComponent(`${lessonTitle} ${suffix}`);
    return {
      title: `${lessonTitle} — ${suffix.charAt(0).toUpperCase() + suffix.slice(1)}`,
      url: `https://www.youtube.com/results?search_query=${query}`,
      thumbnail: null,
    };
  });
}

