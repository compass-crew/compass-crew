import {
  Trophy,
  Users,
  Rocket,
  Sparkles,
  Code2,
  GraduationCap,
  Handshake,
  Globe2,
  BookOpen,
  Briefcase,
  Award,
  Flag,
  Brain,
  GitBranch,
} from "lucide-react";

/**
 * Trust pillars shown in the hero. No fabricated numbers — these are
 * qualitative promises until real metrics exist in the database.
 */
export const STATS = [
  { label: "Community", value: "Growing" },
  { label: "Access", value: "Pan-India" },
  { label: "Opportunities", value: "Monthly" },
  { label: "Tracks", value: "Multiple" },
];

export const TRUST_BADGES = [
  "AI",
  "Open Source",
  "Innovation",
  "Hackathons",
  "Workshops",
  "Research",
  "Community",
];

export const FEATURES = [
  {
    icon: Trophy,
    title: "Hackathons",
    body: "Weekend sprints and season-long build programs where student teams ship real products with mentors and industry judges.",
  },
  {
    icon: Brain,
    title: "AI & Applied Research",
    body: "Reading groups, paper clubs and applied AI tracks — from prompt engineering to fine-tuning small models.",
  },
  {
    icon: GraduationCap,
    title: "Workshops & Bootcamps",
    body: "Structured learning tracks in AI, product, design and engineering — taught by builders shipping in production.",
  },
  {
    icon: Rocket,
    title: "Startup Studio",
    body: "A path from idea to first users. We help student teams validate, prototype and pitch — with mentorship, not fluff.",
  },
  {
    icon: GitBranch,
    title: "Open-Source Labs",
    body: "Contribute to community-maintained repositories, land your first PR, and build a portfolio recruiters actually read.",
  },
  {
    icon: Users,
    title: "Campus Chapters",
    body: "Student-run crews on campus running meetups, hack nights and speaker sessions — with a national community behind them.",
  },
];

/**
 * Hackathons are intentionally not populated with fake dates, prizes or
 * locations. These entries render as elegant "coming soon" cards and will
 * be replaced by database rows once Compass Cloud is wired up.
 */
export const HACKATHONS = [
  {
    slug: "flagship-hackathon",
    title: "Flagship Hackathon",
    tag: "Coming Soon",
    theme: "A national-scale build weekend for student teams across India.",
    status: "Registration opening soon",
    color: "from-primary to-secondary",
  },
  {
    slug: "ai-sprint",
    title: "AI Sprint",
    tag: "Upcoming",
    theme: "A short-form sprint focused on agents, evals and small models.",
    status: "Registration opening soon",
    color: "from-secondary to-accent",
  },
  {
    slug: "campus-season",
    title: "Campus Season",
    tag: "Upcoming",
    theme: "A multi-campus season where student products meet real users.",
    status: "Announcement coming soon",
    color: "from-accent to-primary",
  },
];

/**
 * Empty-state event cards. No fake dates or hosts.
 */
export const EVENTS = [
  {
    slug: "upcoming-workshop",
    title: "Upcoming Workshop",
    kind: "Workshop",
    status: "Coming Soon",
    body: "A hands-on session on AI, product or open-source — announced soon.",
  },
  {
    slug: "upcoming-ama",
    title: "Founder AMA",
    kind: "AMA",
    status: "Stay Tuned",
    body: "Live conversations with founders and engineers — dates to be announced.",
  },
  {
    slug: "upcoming-meetup",
    title: "Campus Meetup",
    kind: "Meetup",
    status: "Coming Soon",
    body: "In-person meetups hosted by Compass campus chapters across India.",
  },
  {
    slug: "upcoming-bootcamp",
    title: "AI Bootcamp",
    kind: "Bootcamp",
    status: "Coming Soon",
    body: "A cohort-based intensive on shipping AI-native products end to end.",
  },
];

export const BENEFITS = [
  {
    icon: Trophy,
    title: "Hackathons",
    body: "Compete in national hackathons and build seasons with mentors, prizes and pilot opportunities.",
  },
  {
    icon: Handshake,
    title: "Networking",
    body: "Meet builders, founders, engineers and researchers across India in one active community.",
  },
  {
    icon: Briefcase,
    title: "Internships",
    body: "Get referred and shortlisted for internships with partner startups and product companies.",
  },
  {
    icon: Brain,
    title: "AI Workshops",
    body: "Hands-on sessions on LLMs, agents, evals, retrieval and applied ML — with real projects.",
  },
  {
    icon: BookOpen,
    title: "Research Opportunities",
    body: "Join paper reading groups and applied research pods with student and faculty collaborators.",
  },
  {
    icon: GitBranch,
    title: "Open Source",
    body: "Contribute to community-maintained repos and land your first meaningful pull request.",
  },
  {
    icon: Rocket,
    title: "Startup Mentorship",
    body: "1:1 mentorship for student founders — from idea validation to first users and first pitch.",
  },
  {
    icon: Award,
    title: "Certificates",
    body: "Earn verifiable participation and completion certificates for programs and bootcamps.",
  },
  {
    icon: Sparkles,
    title: "Portfolio Building",
    body: "Ship in public, document your work and build a portfolio that recruiters actually read.",
  },
  {
    icon: Flag,
    title: "Campus Ambassador",
    body: "Represent Compass Crew on your campus, run local events and grow into a community leader.",
  },
];

/**
 * Sponsors are intentionally empty. The homepage renders a "partner with us"
 * empty state instead of fabricated logos.
 */
export const SPONSORS: string[] = [];

/**
 * Testimonials are intentionally empty until real community stories exist.
 * The homepage hides the section when this array is empty.
 */
export const TESTIMONIALS: { quote: string; name: string; role: string }[] = [];

export const FAQS = [
  {
    q: "Who can join Compass Crew?",
    a: "Any student in India — school, undergrad or grad — who is curious about AI, technology, innovation, open source or startups. Membership is free.",
  },
  {
    q: "Do I need to know how to code?",
    a: "No. Our community welcomes designers, product folks, researchers, writers and operators. We'll help you find a track that fits you.",
  },
  {
    q: "How do Compass Crew hackathons work?",
    a: "You register solo or as a team, pick a theme, build for the given duration and demo to a panel of judges. Details for each hackathon are announced ahead of time.",
  },
  {
    q: "Can my campus start a chapter?",
    a: "Yes. Reach out via the Partner With Us page and our chapter team will share the playbook and next steps.",
  },
  {
    q: "Is there a fee to join?",
    a: "Core membership and most events are free. Some intensive bootcamps may have a nominal cohort fee, with scholarships available.",
  },
  {
    q: "How can companies partner with Compass Crew?",
    a: "We partner with companies on hackathons, workshops and campus programs. Reach out via the Partner With Us page to start a conversation.",
  },
];

/**
 * Blog posts are empty until real editorial content exists.
 */
export const BLOG_POSTS: {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  readTime: string;
  tag: string;
}[] = [];

export const MISSION = {
  what: "Compass Crew is a student-led community for AI, technology, innovation and startups — a home for the next generation of Indian builders.",
  mission:
    "To give every student in India a real path into building — through hackathons, workshops, open-source, research and startup programs.",
  vision:
    "A generation of Indian students who don't just learn technology, but ship it — and build companies, tools and research that matter globally.",
  why: "Talent is everywhere. Opportunity isn't. Compass Crew exists to close that gap — with community, mentorship and programs that any student can access.",
  who: "Any student in India — from tier-1 colleges to smaller campuses — curious about AI, engineering, design, product, research or startups.",
  roadmap: [
    "Launch flagship hackathon season",
    "Open campus chapters across India",
    "Ship the Compass Crew learning tracks",
    "Kick off the Compass startup studio cohort",
    "Publish community research and open-source projects",
  ],
};
