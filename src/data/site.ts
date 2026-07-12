import { Trophy, Users, Rocket, Sparkles, Code2, GraduationCap, Handshake, Globe2 } from "lucide-react";

export const STATS = [
  { label: "Student members", value: "12k+" },
  { label: "Campus chapters", value: "48" },
  { label: "Hackathons hosted", value: "60+" },
  { label: "Startups launched", value: "22" },
];

export const FEATURES = [
  {
    icon: Trophy,
    title: "National hackathons",
    body: "Weekend sprints and month-long build seasons with mentors, prizes and pilot opportunities.",
  },
  {
    icon: GraduationCap,
    title: "Bootcamps & workshops",
    body: "Learning tracks in AI, product, design and engineering — taught by builders shipping in the real world.",
  },
  {
    icon: Rocket,
    title: "Startup studio",
    body: "From idea to first users. We help student teams validate, prototype and pitch to real investors.",
  },
  {
    icon: Users,
    title: "Campus chapters",
    body: "Local crews at 48 campuses running meetups, hack nights and speaker sessions every month.",
  },
  {
    icon: Code2,
    title: "Open-source labs",
    body: "Contribute to community-maintained repos, publish under Compass Labs, and land your first PR.",
  },
  {
    icon: Sparkles,
    title: "Mentor network",
    body: "Founders, engineers and designers from India's leading startups review your work and open doors.",
  },
];

export const HACKATHONS = [
  {
    slug: "buildhack-2026",
    title: "BuildHack 2026",
    tag: "Flagship",
    location: "Bengaluru · Hybrid",
    date: "Feb 14 – 16, 2026",
    prize: "₹8L pool",
    theme: "AI-native products for Bharat",
    status: "Registrations open",
    color: "from-primary to-secondary",
  },
  {
    slug: "ai-frontier",
    title: "AI Frontier Hack",
    tag: "48h Sprint",
    location: "Online",
    date: "Mar 22 – 24, 2026",
    prize: "₹3L pool",
    theme: "Agents, evals and small models",
    status: "Registrations open",
    color: "from-secondary to-accent",
  },
  {
    slug: "campus-cup",
    title: "Campus Cup",
    tag: "Season",
    location: "12 campuses",
    date: "Apr – Jun, 2026",
    prize: "₹5L + pilots",
    theme: "Student products, real users",
    status: "Coming soon",
    color: "from-accent to-primary",
  },
];

export const EVENTS = [
  {
    slug: "founder-office-hours",
    title: "Founder Office Hours",
    kind: "AMA",
    date: "Jan 24, 2026",
    time: "7:00 PM IST",
    mode: "Online",
    host: "with Aditi R., YC founder",
  },
  {
    slug: "design-clinic",
    title: "Design Clinic: Portfolios",
    kind: "Workshop",
    date: "Feb 02, 2026",
    time: "6:30 PM IST",
    mode: "Online",
    host: "with Compass Design",
  },
  {
    slug: "delhi-meetup",
    title: "Delhi Chapter Meetup",
    kind: "Meetup",
    date: "Feb 08, 2026",
    time: "5:00 PM",
    mode: "IIT Delhi",
    host: "Delhi crew",
  },
  {
    slug: "ai-bootcamp",
    title: "AI Engineering Bootcamp",
    kind: "Bootcamp",
    date: "Mar 04 – 20, 2026",
    time: "Evenings",
    mode: "Cohort",
    host: "Compass Learn",
  },
];

export const BENEFITS = [
  { icon: Handshake, title: "Mentorship 1:1", body: "Get matched with a mentor for your goals — resume, product, research or startup." },
  { icon: Globe2, title: "Global network", body: "Community members from 200+ campuses and 40+ partner companies." },
  { icon: Sparkles, title: "Exclusive drops", body: "Credits, invites and job leads from partners like Vercel, Notion, GitHub and more." },
  { icon: Trophy, title: "Recognition", body: "Ship in public, earn badges, and get spotlighted in our monthly build digest." },
];

export const SPONSORS = [
  "Vercel", "Notion", "GitHub", "Figma", "MongoDB", "Postman", "Cloudflare", "Razorpay",
];

export const TESTIMONIALS = [
  {
    quote: "Compass Crew took me from writing my first line of code to leading a hackathon team. The mentors are unreal.",
    name: "Ishaan M.",
    role: "CS undergrad · BITS Pilani",
  },
  {
    quote: "I met my co-founder at a Compass hack night. Six months later we shipped our beta to 3,000 students.",
    name: "Priya K.",
    role: "Founder · Notedeck",
  },
  {
    quote: "The most legit student community in India for AI and product. It's how I found my first internship.",
    name: "Rahul S.",
    role: "AI intern · Sarvam",
  },
];

export const FAQS = [
  {
    q: "Who can join Compass Crew?",
    a: "Any student in India — school, undergrad or grad — passionate about tech, AI, design or startups. Membership is free.",
  },
  {
    q: "Do I need to know how to code?",
    a: "No. Our community includes designers, product folks, researchers, storytellers and operators. We'll help you find your track.",
  },
  {
    q: "How do hackathons work?",
    a: "You register solo or as a team, pick a theme, build for the given duration, and demo to a panel of judges. Prizes, offers and pilots are on the line.",
  },
  {
    q: "Can my campus start a chapter?",
    a: "Yes. Fill out the partner form and our chapter team will reach out with the playbook.",
  },
  {
    q: "Is there a fee?",
    a: "Core membership and most events are free. Some intensive bootcamps have a nominal cohort fee with scholarships available.",
  },
  {
    q: "How do sponsorships work?",
    a: "We partner with companies on hackathons, workshops and campus tours. Reach out via the Partner With Us page.",
  },
];

export const BLOG_POSTS = [
  {
    slug: "state-of-student-ai-2026",
    title: "State of Student AI in India, 2026",
    excerpt: "What 12,000 students told us about building with LLMs, agents and open models this year.",
    date: "Jan 08, 2026",
    author: "Compass Research",
    readTime: "8 min read",
    tag: "Report",
  },
  {
    slug: "how-to-win-a-hackathon",
    title: "How to actually win a hackathon (from 12 winners)",
    excerpt: "Scope, storytelling and shipping — the playbook we wish someone gave us in year one.",
    date: "Dec 22, 2025",
    author: "Ananya P.",
    readTime: "6 min read",
    tag: "Playbook",
  },
  {
    slug: "starting-campus-chapter",
    title: "Starting a Compass chapter on your campus",
    excerpt: "A step-by-step guide to launching, growing and running a Compass chapter in your college.",
    date: "Dec 04, 2025",
    author: "Chapter Team",
    readTime: "5 min read",
    tag: "Guide",
  },
];
