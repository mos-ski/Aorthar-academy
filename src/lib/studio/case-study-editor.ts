export type CaseStudyListFields = {
  tags: string;
  services: string;
  featured_in: string;
};

type CaseStudyLists = {
  tags: string[];
  services: string[];
  featured_in: string[];
};

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function createCaseStudyListFields(study: CaseStudyLists): CaseStudyListFields {
  return {
    tags: study.tags.join(', '),
    services: study.services.join(', '),
    featured_in: study.featured_in.join(', '),
  };
}

export function parseCaseStudyListFields(fields: CaseStudyListFields): CaseStudyLists {
  return {
    tags: splitList(fields.tags),
    services: splitList(fields.services),
    featured_in: splitList(fields.featured_in),
  };
}
