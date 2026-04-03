/**
 * Internship subdomain layout.
 *
 * Served at internship.aorthar.com
 * Provides a standalone layout — no shared app chrome.
 * The internship page renders its own header/nav, so this is a minimal wrapper.
 */

export default function InternshipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
