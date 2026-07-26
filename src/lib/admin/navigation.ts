export type AdminNavCandidate = {
  href: string;
  matches?: boolean;
};

function pathFromHref(href: string): string {
  return href.split('?')[0] ?? href;
}

export function selectActiveNavHref(
  candidates: AdminNavCandidate[],
  pathname: string,
): string | null {
  const matchingCandidates = candidates.filter((candidate) => {
    if (candidate.matches !== undefined) return candidate.matches;
    const candidatePath = pathFromHref(candidate.href);
    return pathname === candidatePath || pathname.startsWith(`${candidatePath}/`);
  });

  matchingCandidates.sort((left, right) => {
    const pathLengthDifference = pathFromHref(right.href).length - pathFromHref(left.href).length;
    if (pathLengthDifference !== 0) return pathLengthDifference;
    return Number(right.matches === true) - Number(left.matches === true);
  });

  return matchingCandidates[0]?.href ?? null;
}
