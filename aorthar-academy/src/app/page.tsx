import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Award,
  BookOpen,
  CheckCircle,
  TrendingUp,
  Users,
  Sparkles,
  GraduationCap,
  Zap,
} from "lucide-react";

const stats = [
  { value: "40+", label: "Courses" },
  { value: "4", label: "Year Program" },
  { value: "100%", label: "Free to start" },
  { value: "5.0", label: "GPA Scale" },
];

const features = [
  {
    icon: BookOpen,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    title: "4-Year Structured Curriculum",
    desc: "University-style progression from Year 100 to 400, covering fundamentals to professional practice in design.",
  },
  {
    icon: TrendingUp,
    color: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    title: "GPA & Grade Tracking",
    desc: "Real academic grading — earn grades, track your GPA, and view your transcript to monitor progress.",
  },
  {
    icon: Award,
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    title: "Assessment Engine",
    desc: "Quizzes and exams with anti-cheat measures, cooldowns, and server-side grading to validate your knowledge.",
  },
  {
    icon: Users,
    color: "bg-green-500/10 text-green-600 dark:text-green-400",
    title: "Open Source & Community",
    desc: "Suggest courses, lessons, and resources. The curriculum is built by the community, for the community.",
  },
];

const tracks = [
  "UI/UX Design",
  "Product Management",
  "Product Design",
  "Design Engineering (FE)",
  "Backend Engineering",
  "Scrum & Agile",
  "Operations",
  "Quality Assurance",
];

const freeFeatures = [
  "Year 100–300 curriculum access",
  "YouTube-based lessons",
  "3 quiz attempts per course",
  "Community contributions",
];

const premiumFeatures = [
  "Everything in Free",
  "Year 400 specialization access",
  "Unlimited quiz attempts",
  "GPA transcript export",
  "Capstone project submission",
  "Mentorship eligibility",
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">
            Aorthar<span className="text-primary">.</span>
          </span>
          <nav className="flex items-center gap-2">
            <Link
              href="/pricing"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block px-3 py-1.5"
            >
              Pricing
            </Link>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Get Started Free</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-primary/6 blur-3xl" />
          <div className="absolute -top-20 right-0 h-[500px] w-[500px] rounded-full bg-violet-500/5 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 pt-24 pb-16 text-center space-y-7">
          <Badge variant="outline" className="gap-1.5 px-3 py-1">
            <Sparkles className="h-3 w-3" />
            Now Focused on the School of Design
          </Badge>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1]">
            A University-Level
            <br />
            Design Education.
            <br />
            <span className="text-primary">Free for everyone.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A structured, open-source design curriculum for self-taught creatives
            who deserve a world-class education without the cost.
          </p>
          <div className="flex justify-center gap-3 flex-wrap pt-2">
            <Button size="lg" asChild>
              <Link href="/register">Start Learning — It&apos;s Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">View Premium Plans</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y bg-muted/30">
        <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tracks ── */}
      <section className="max-w-4xl mx-auto px-6 py-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground text-center mb-4">
          Disciplines
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {tracks.map((track) => (
            <Badge key={track} variant="secondary" className="text-sm py-1.5 px-4">
              {track}
            </Badge>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Everything you need to level up</h2>
          <p className="text-muted-foreground mt-2">Structured, assessed, and community-driven.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-10">
          {features.map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="flex gap-4">
              <div className={`shrink-0 h-11 w-11 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1.5">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="bg-muted/30 border-y">
        <div className="max-w-3xl mx-auto px-6 py-16 space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Start free. Go further with Premium.</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Unlock Year 400 and advanced features when you&apos;re ready.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-5 text-left">
            {/* Free */}
            <div className="border rounded-xl p-6 space-y-3 bg-background">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold text-lg">Free</h3>
              </div>
              <p className="text-2xl font-bold">
                ₦0{" "}
                <span className="text-sm font-normal text-muted-foreground">forever</span>
              </p>
              <div className="space-y-2 pt-1">
                {freeFeatures.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            {/* Premium */}
            <div className="border-2 border-primary rounded-xl p-6 space-y-3 bg-background relative">
              <Badge className="absolute top-4 right-4 text-xs">Most Popular</Badge>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Premium</h3>
              </div>
              <p className="text-2xl font-bold">
                <Link href="/pricing" className="text-primary hover:underline text-base font-medium">
                  See pricing →
                </Link>
              </p>
              <div className="space-y-2 pt-1">
                {premiumFeatures.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="text-center">
            <Button size="lg" asChild>
              <Link href="/register">Create Your Free Account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center space-y-5">
        <h2 className="text-4xl font-bold">Ready to start your design journey?</h2>
        <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Join students building real skills through a structured, community-reviewed curriculum.
        </p>
        <Button size="lg" asChild>
          <Link href="/register">Get Started for Free</Link>
        </Button>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span className="font-bold text-foreground text-base">
            Aorthar<span className="text-primary">.</span>
          </span>
          <p>Open Source · Built for learners who deserve better.</p>
          <div className="flex gap-4">
            <Link href="/pricing" className="hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="hover:text-foreground transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
