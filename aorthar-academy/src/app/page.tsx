import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Award,
  BookOpen,
  CheckCircle,
  TrendingUp,
  Users,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "4-Year Structured Design Curriculum",
    desc: "A university-style progression from Year 100 to 400, focused on a comprehensive design education from fundamentals to professional practice.",
  },
  {
    icon: TrendingUp,
    title: "GPA & Grade Tracking",
    desc: "Real academic grading — earn grades, track your GPA, and view your transcript to monitor your progress.",
  },
  {
    icon: Award,
    title: "Assessment Engine",
    desc: "Quizzes and exams with anti-cheat measures, cooldowns, and server-side grading to validate your knowledge.",
  },
  {
    icon: Users,
    title: "Open Source & Community-Driven",
    desc: "Suggest courses, lessons, and resources. The curriculum is built by the community, for the community.",
  },
];

const tracks = [
  "Visual & UI Design",
  "UX & User Research",
  "Interaction Design",
  "Design Systems",
  "Information Architecture",
  "Professional Practice",
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <span className="text-xl font-bold tracking-tight">
          Aorthar<span className="text-primary">.</span>
        </span>
        <nav className="flex items-center gap-4">
          <Link
            href="/pricing"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Pricing
          </Link>
          <Button variant="outline" size="sm" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">Get Started Free</Link>
          </Button>
        </nav>
      </header>

      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center space-y-6">
        <Badge variant="outline">Now Focused on the School of Design</Badge>
        <h1 className="text-5xl font-bold tracking-tight leading-tight">
          A University-Level Design Education.
          <br />
          <span className="text-primary">Free for everyone.</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Aorthar Academy provides a structured, open-source design curriculum for self-taught creatives who deserve a world-class education without the cost.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Button size="lg" asChild>
            <Link href="/register">Start Learning - It&apos;s Free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/pricing">View Premium Features</Link>
          </Button>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex flex-wrap justify-center gap-2">
          {tracks.map((track) => (
            <Badge
              key={track}
              variant="secondary"
              className="text-sm py-1 px-3"
            >
              {track}
            </Badge>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-8">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex gap-4">
            <div className="shrink-0 h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">{title}</h3>
              <p className="text-muted-foreground text-sm">{desc}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="max-w-3xl mx-auto px-6 py-16 text-center space-y-8">
        <h2 className="text-3xl font-bold">Start free. Go further with Premium.</h2>
        <div className="grid md:grid-cols-2 gap-6 text-left">
          <div className="border rounded-lg p-6 space-y-3">
            <h3 className="font-semibold text-lg">Free</h3>
            {[
              "Year 100–300 curriculum access",
              "YouTube-based lessons",
              "3 quiz attempts per course",
              "Community contributions",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {item}
              </div>
            ))}
          </div>
          <div className="border-primary border-2 rounded-lg p-6 space-y-3 relative">
            <Badge className="absolute top-3 right-3 text-xs">Premium</Badge>
            <h3 className="font-semibold text-lg">Premium</h3>
            {[
              "Everything in Free",
              "Year 400 specialization access",
              "Unlimited quiz attempts",
              "GPA transcript export",
              "Capstone project submission",
              "Mentorship eligibility",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <Button size="lg" asChild>
          <Link href="/register">Create Your Free Account</Link>
        </Button>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>Aorthar Academy · Open Source · Built for learners who deserve better.</p>
      </footer>
    </div>
  );
}
