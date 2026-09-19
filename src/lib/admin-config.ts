// Central resource configuration used by the generic admin CMS.
// Each resource maps a Supabase table to list columns and form fields.

export type FieldType =
  | "text"
  | "textarea"
  | "markdown"
  | "slug"
  | "email"
  | "url"
  | "number"
  | "boolean"
  | "select"
  | "tags"
  | "datetime"
  | "image"
  | "json";

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: readonly { value: string; label: string }[];
  from?: string; // for slug: source field
  rows?: number;
  folder?: string; // for image upload
}

export interface ListColumn {
  key: string;
  label: string;
  type?: "text" | "date" | "status" | "boolean" | "badge";
}

export interface ResourceConfig {
  key: string;
  table: string;
  singular: string;
  plural: string;
  icon: string; // lucide icon name
  softDelete?: boolean;
  hasStatus?: boolean;
  hasSlug?: boolean;
  defaultOrder?: { column: string; ascending: boolean };
  searchColumns: string[];
  filterField?: {
    name: string;
    label: string;
    options: readonly { value: string; label: string }[];
  };
  listColumns: ListColumn[];
  fields: FieldConfig[];
}

const CONTENT_STATUS = [
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
] as const;

const APPLICATION_STATUS = [
  { value: "pending", label: "Pending" },
  { value: "reviewing", label: "Reviewing" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
] as const;

const EVENT_KIND = [
  { value: "workshop", label: "Workshop" },
  { value: "webinar", label: "Webinar" },
  { value: "hackathon", label: "Hackathon" },
  { value: "bootcamp", label: "Bootcamp" },
  { value: "meetup", label: "Meetup" },
  { value: "ama", label: "AMA" },
] as const;

const EVENT_MODE = [
  { value: "online", label: "Online" },
  { value: "hybrid", label: "Hybrid" },
  { value: "in_person", label: "In person" },
] as const;

const SPONSOR_TIER = [
  { value: "title", label: "Title" },
  { value: "platinum", label: "Platinum" },
  { value: "gold", label: "Gold" },
  { value: "silver", label: "Silver" },
  { value: "bronze", label: "Bronze" },
  { value: "community", label: "Community" },
] as const;

const PARTNER_KIND = [
  { value: "academic", label: "Academic" },
  { value: "community", label: "Community" },
  { value: "media", label: "Media" },
  { value: "ecosystem", label: "Ecosystem" },
  { value: "technology", label: "Technology" },
] as const;

const CAREER_CATEGORY = [
  { value: "volunteer", label: "Volunteer" },
  { value: "ambassador", label: "Ambassador" },
  { value: "organizer", label: "Organizer" },
  { value: "internship", label: "Internship" },
  { value: "full_time", label: "Full time" },
  { value: "future", label: "Future openings" },
] as const;

const ANNOUNCEMENT_AUDIENCE = [
  { value: "all", label: "Everyone" },
  { value: "participants", label: "Participants" },
  { value: "organizers", label: "Organizers" },
  { value: "judges", label: "Judges" },
  { value: "mentors", label: "Mentors" },
  { value: "ambassadors", label: "Ambassadors" },
] as const;

const BLOG_CATEGORIES = [
  { value: "ai", label: "AI" },
  { value: "technology", label: "Technology" },
  { value: "startups", label: "Startups" },
  { value: "hackathons", label: "Hackathons" },
  { value: "career", label: "Career" },
  { value: "programming", label: "Programming" },
  { value: "innovation", label: "Innovation" },
] as const;

const RESOURCE_CATEGORIES = [
  { value: "ai", label: "Artificial Intelligence" },
  { value: "ml", label: "Machine Learning" },
  { value: "data", label: "Data Science" },
  { value: "oss", label: "Open Source" },
  { value: "hackathons", label: "Hackathons" },
  { value: "career", label: "Career" },
  { value: "resume", label: "Resume" },
  { value: "interview", label: "Interview" },
  { value: "research", label: "Research" },
  { value: "startup", label: "Startup" },
] as const;

export const RESOURCES: ResourceConfig[] = [
  {
    key: "homepage",
    table: "cms_homepage_sections",
    singular: "Homepage Section",
    plural: "Homepage Sections",
    icon: "LayoutTemplate",
    softDelete: true,
    defaultOrder: { column: "sort_order", ascending: true },
    searchColumns: ["key", "title"],
    listColumns: [
      { key: "key", label: "Key" },
      { key: "title", label: "Title" },
      { key: "sort_order", label: "Order" },
      { key: "enabled", label: "Enabled", type: "boolean" },
      { key: "updated_at", label: "Updated", type: "date" },
    ],
    fields: [
      {
        name: "key",
        label: "Key (unique)",
        type: "text",
        required: true,
        helpText: "Machine-readable id, e.g. hero, stats, faq",
      },
      { name: "title", label: "Title", type: "text" },
      { name: "subtitle", label: "Subtitle", type: "text" },
      { name: "body", label: "Body", type: "markdown", rows: 8 },
      { name: "media_url", label: "Media image", type: "image", folder: "homepage" },
      { name: "cta_label", label: "CTA label", type: "text" },
      { name: "cta_url", label: "CTA URL", type: "url" },
      { name: "sort_order", label: "Sort order", type: "number" },
      { name: "enabled", label: "Enabled", type: "boolean" },
      { name: "data", label: "Extra data (JSON)", type: "json" },
    ],
  },
  {
    key: "blog",
    table: "blog_posts",
    singular: "Blog Post",
    plural: "Blog Posts",
    icon: "Newspaper",
    softDelete: true,
    hasStatus: true,
    hasSlug: true,
    defaultOrder: { column: "created_at", ascending: false },
    searchColumns: ["title", "slug", "excerpt"],
    filterField: { name: "status", label: "Status", options: CONTENT_STATUS },
    listColumns: [
      { key: "title", label: "Title" },
      { key: "category", label: "Category", type: "badge" },
      { key: "status", label: "Status", type: "status" },
      { key: "published_at", label: "Published", type: "date" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "slug", from: "title", required: true },
      { name: "excerpt", label: "Excerpt", type: "textarea", rows: 3 },
      { name: "cover_url", label: "Cover image", type: "image", folder: "blog" },
      { name: "category", label: "Category", type: "select", options: BLOG_CATEGORIES },
      { name: "tags", label: "Tags", type: "tags" },
      { name: "author_name", label: "Author name", type: "text" },
      { name: "reading_minutes", label: "Reading minutes", type: "number" },
      { name: "body_md", label: "Body (Markdown)", type: "markdown", rows: 16, required: true },
      { name: "featured", label: "Featured", type: "boolean" },
      { name: "status", label: "Status", type: "select", options: CONTENT_STATUS, required: true },
      { name: "published_at", label: "Publish date", type: "datetime" },
      { name: "scheduled_for", label: "Scheduled for", type: "datetime" },
    ],
  },
  {
    key: "resources",
    table: "resources",
    singular: "Resource",
    plural: "Resources",
    icon: "BookOpen",
    softDelete: true,
    hasStatus: true,
    hasSlug: true,
    defaultOrder: { column: "sort_order", ascending: true },
    searchColumns: ["title", "slug", "description"],
    filterField: { name: "category", label: "Category", options: RESOURCE_CATEGORIES },
    listColumns: [
      { key: "title", label: "Title" },
      { key: "category", label: "Category", type: "badge" },
      { key: "status", label: "Status", type: "status" },
      { key: "sort_order", label: "Order" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "slug", from: "title", required: true },
      { name: "description", label: "Description", type: "textarea", rows: 3 },
      {
        name: "category",
        label: "Category",
        type: "select",
        options: RESOURCE_CATEGORIES,
        required: true,
      },
      { name: "tags", label: "Tags", type: "tags" },
      { name: "cover_url", label: "Cover image", type: "image", folder: "resources" },
      { name: "url", label: "External URL", type: "url" },
      { name: "download_url", label: "Download URL", type: "url" },
      { name: "is_external", label: "External resource", type: "boolean" },
      { name: "sort_order", label: "Sort order", type: "number" },
      { name: "status", label: "Status", type: "select", options: CONTENT_STATUS, required: true },
      { name: "published_at", label: "Publish date", type: "datetime" },
    ],
  },
  {
    key: "events",
    table: "site_events",
    singular: "Event",
    plural: "Events",
    icon: "Calendar",
    softDelete: true,
    hasStatus: true,
    hasSlug: true,
    defaultOrder: { column: "starts_at", ascending: false },
    searchColumns: ["title", "slug", "description"],
    filterField: { name: "kind", label: "Kind", options: EVENT_KIND },
    listColumns: [
      { key: "title", label: "Title" },
      { key: "kind", label: "Kind", type: "badge" },
      { key: "mode", label: "Mode", type: "badge" },
      { key: "starts_at", label: "Starts", type: "date" },
      { key: "status", label: "Status", type: "status" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "slug", from: "title", required: true },
      { name: "description", label: "Description", type: "textarea", rows: 3 },
      { name: "banner_url", label: "Banner image", type: "image", folder: "events" },
      { name: "kind", label: "Kind", type: "select", options: EVENT_KIND, required: true },
      { name: "mode", label: "Mode", type: "select", options: EVENT_MODE, required: true },
      { name: "location", label: "Location", type: "text" },
      { name: "starts_at", label: "Starts at", type: "datetime" },
      { name: "ends_at", label: "Ends at", type: "datetime" },
      { name: "registration_url", label: "Registration URL", type: "url" },
      { name: "body_md", label: "Details (Markdown)", type: "markdown", rows: 10 },
      {
        name: "speakers",
        label: "Speakers (JSON array)",
        type: "json",
        helpText: '[{"name":"...","title":"...","avatar_url":"..."}]',
      },
      {
        name: "schedule",
        label: "Schedule (JSON array)",
        type: "json",
        helpText: '[{"time":"10:00","title":"..."}]',
      },
      {
        name: "resources",
        label: "Resources (JSON array)",
        type: "json",
        helpText: '[{"label":"Slides","url":"..."}]',
      },
      { name: "featured", label: "Featured", type: "boolean" },
      { name: "status", label: "Status", type: "select", options: CONTENT_STATUS, required: true },
      { name: "published_at", label: "Publish date", type: "datetime" },
    ],
  },
  {
    key: "announcements",
    table: "site_announcements",
    singular: "Announcement",
    plural: "Announcements",
    icon: "Megaphone",
    softDelete: true,
    hasStatus: true,
    defaultOrder: { column: "created_at", ascending: false },
    searchColumns: ["title", "body"],
    listColumns: [
      { key: "title", label: "Title" },
      { key: "audience", label: "Audience", type: "badge" },
      { key: "pinned", label: "Pinned", type: "boolean" },
      { key: "status", label: "Status", type: "status" },
      { key: "published_at", label: "Published", type: "date" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "body", label: "Body", type: "markdown", rows: 6, required: true },
      { name: "link_url", label: "Link URL", type: "url" },
      { name: "link_label", label: "Link label", type: "text" },
      {
        name: "audience",
        label: "Audience",
        type: "select",
        options: ANNOUNCEMENT_AUDIENCE,
        required: true,
      },
      { name: "pinned", label: "Pinned", type: "boolean" },
      { name: "status", label: "Status", type: "select", options: CONTENT_STATUS, required: true },
      { name: "published_at", label: "Publish date", type: "datetime" },
      { name: "expires_at", label: "Expires at", type: "datetime" },
    ],
  },
  {
    key: "sponsors",
    table: "sponsors",
    singular: "Sponsor",
    plural: "Sponsors",
    icon: "Award",
    softDelete: true,
    hasStatus: true,
    defaultOrder: { column: "sort_order", ascending: true },
    searchColumns: ["name", "blurb"],
    filterField: { name: "tier", label: "Tier", options: SPONSOR_TIER },
    listColumns: [
      { key: "name", label: "Name" },
      { key: "tier", label: "Tier", type: "badge" },
      { key: "status", label: "Status", type: "status" },
      { key: "sort_order", label: "Order" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "logo_url", label: "Logo", type: "image", folder: "sponsors" },
      { name: "url", label: "Website", type: "url" },
      { name: "tier", label: "Tier", type: "select", options: SPONSOR_TIER, required: true },
      { name: "blurb", label: "Blurb", type: "textarea", rows: 3 },
      { name: "sort_order", label: "Sort order", type: "number" },
      { name: "status", label: "Status", type: "select", options: CONTENT_STATUS, required: true },
    ],
  },
  {
    key: "partners",
    table: "partners",
    singular: "Partner",
    plural: "Partners",
    icon: "Handshake",
    softDelete: true,
    hasStatus: true,
    defaultOrder: { column: "sort_order", ascending: true },
    searchColumns: ["name", "blurb"],
    filterField: { name: "kind", label: "Kind", options: PARTNER_KIND },
    listColumns: [
      { key: "name", label: "Name" },
      { key: "kind", label: "Kind", type: "badge" },
      { key: "status", label: "Status", type: "status" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "logo_url", label: "Logo", type: "image", folder: "partners" },
      { name: "url", label: "Website", type: "url" },
      { name: "kind", label: "Kind", type: "select", options: PARTNER_KIND, required: true },
      { name: "blurb", label: "Blurb", type: "textarea", rows: 3 },
      { name: "sort_order", label: "Sort order", type: "number" },
      { name: "status", label: "Status", type: "select", options: CONTENT_STATUS, required: true },
    ],
  },
  {
    key: "partner-applications",
    table: "partner_applications",
    singular: "Partner Application",
    plural: "Partner Applications",
    icon: "Inbox",
    softDelete: true,
    defaultOrder: { column: "created_at", ascending: false },
    searchColumns: ["org_name", "contact_name", "email"],
    filterField: { name: "status", label: "Status", options: APPLICATION_STATUS },
    listColumns: [
      { key: "org_name", label: "Organization" },
      { key: "contact_name", label: "Contact" },
      { key: "email", label: "Email" },
      { key: "status", label: "Status", type: "status" },
      { key: "created_at", label: "Received", type: "date" },
    ],
    fields: [
      { name: "org_name", label: "Organization", type: "text", required: true },
      { name: "contact_name", label: "Contact name", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "phone", label: "Phone", type: "text" },
      { name: "website", label: "Website", type: "url" },
      { name: "partnership_type", label: "Type", type: "text" },
      { name: "message", label: "Message", type: "textarea", rows: 6, required: true },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: APPLICATION_STATUS,
        required: true,
      },
      { name: "admin_notes", label: "Admin notes", type: "textarea", rows: 3 },
    ],
  },
  {
    key: "public-judges",
    table: "public_judges",
    singular: "Public Judge",
    plural: "Public Judges",
    icon: "Gavel",
    softDelete: true,
    hasStatus: true,
    defaultOrder: { column: "sort_order", ascending: true },
    searchColumns: ["name", "title", "company"],
    listColumns: [
      { key: "name", label: "Name" },
      { key: "title", label: "Title" },
      { key: "company", label: "Company" },
      { key: "status", label: "Status", type: "status" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "title", label: "Title", type: "text" },
      { name: "company", label: "Company", type: "text" },
      { name: "avatar_url", label: "Avatar", type: "image", folder: "judges" },
      { name: "bio", label: "Bio", type: "textarea", rows: 4 },
      { name: "linkedin_url", label: "LinkedIn", type: "url" },
      { name: "twitter_url", label: "Twitter", type: "url" },
      { name: "event_label", label: "Event", type: "text" },
      { name: "sort_order", label: "Sort order", type: "number" },
      { name: "status", label: "Status", type: "select", options: CONTENT_STATUS, required: true },
    ],
  },
  {
    key: "ambassador-applications",
    table: "ambassador_applications",
    singular: "Ambassador Application",
    plural: "Ambassador Applications",
    icon: "GraduationCap",
    softDelete: true,
    defaultOrder: { column: "created_at", ascending: false },
    searchColumns: ["full_name", "email", "college"],
    filterField: { name: "status", label: "Status", options: APPLICATION_STATUS },
    listColumns: [
      { key: "full_name", label: "Name" },
      { key: "college", label: "College" },
      { key: "email", label: "Email" },
      { key: "status", label: "Status", type: "status" },
      { key: "created_at", label: "Received", type: "date" },
    ],
    fields: [
      { name: "full_name", label: "Full name", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "phone", label: "Phone", type: "text" },
      { name: "college", label: "College", type: "text", required: true },
      { name: "branch", label: "Branch", type: "text" },
      { name: "year_of_study", label: "Year of study", type: "text" },
      { name: "linkedin_url", label: "LinkedIn", type: "url" },
      { name: "why_you", label: "Why you", type: "textarea", rows: 4, required: true },
      { name: "prior_experience", label: "Prior experience", type: "textarea", rows: 3 },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: APPLICATION_STATUS,
        required: true,
      },
      { name: "admin_notes", label: "Admin notes", type: "textarea", rows: 3 },
    ],
  },
  {
    key: "mentor-applications",
    table: "mentor_applications",
    singular: "Mentor Application",
    plural: "Mentor Applications",
    icon: "UserRoundCog",
    softDelete: true,
    defaultOrder: { column: "created_at", ascending: false },
    searchColumns: ["full_name", "email", "company"],
    filterField: { name: "status", label: "Status", options: APPLICATION_STATUS },
    listColumns: [
      { key: "full_name", label: "Name" },
      { key: "company", label: "Company" },
      { key: "email", label: "Email" },
      { key: "status", label: "Status", type: "status" },
      { key: "created_at", label: "Received", type: "date" },
    ],
    fields: [
      { name: "full_name", label: "Full name", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "phone", label: "Phone", type: "text" },
      { name: "job_title", label: "Current role", type: "text" },
      { name: "company", label: "Company", type: "text" },
      { name: "linkedin_url", label: "LinkedIn", type: "url" },
      { name: "expertise", label: "Areas of expertise", type: "tags" },
      { name: "years_experience", label: "Years of experience", type: "number" },
      { name: "motivation", label: "Motivation", type: "textarea", rows: 4, required: true },
      { name: "availability", label: "Availability", type: "text" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: APPLICATION_STATUS,
        required: true,
      },
      { name: "admin_notes", label: "Admin notes", type: "textarea", rows: 3 },
    ],
  },
  {
    key: "careers",
    table: "careers",
    singular: "Career Opening",
    plural: "Careers",
    icon: "Briefcase",
    softDelete: true,
    hasStatus: true,
    hasSlug: true,
    defaultOrder: { column: "sort_order", ascending: true },
    searchColumns: ["title", "slug", "description"],
    filterField: { name: "category", label: "Category", options: CAREER_CATEGORY },
    listColumns: [
      { key: "title", label: "Title" },
      { key: "category", label: "Category", type: "badge" },
      { key: "location", label: "Location" },
      { key: "status", label: "Status", type: "status" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "slug", from: "title", required: true },
      {
        name: "category",
        label: "Category",
        type: "select",
        options: CAREER_CATEGORY,
        required: true,
      },
      { name: "description", label: "Description", type: "textarea", rows: 3 },
      { name: "body_md", label: "Details (Markdown)", type: "markdown", rows: 10 },
      { name: "location", label: "Location", type: "text" },
      { name: "mode", label: "Mode", type: "select", options: EVENT_MODE },
      { name: "apply_url", label: "Apply URL", type: "url" },
      { name: "sort_order", label: "Sort order", type: "number" },
      { name: "status", label: "Status", type: "select", options: CONTENT_STATUS, required: true },
      { name: "published_at", label: "Publish date", type: "datetime" },
    ],
  },
  {
    key: "contact-messages",
    table: "contact_messages",
    singular: "Contact Message",
    plural: "Contact Messages",
    icon: "MessageSquare",
    softDelete: true,
    defaultOrder: { column: "created_at", ascending: false },
    searchColumns: ["name", "email", "subject", "message"],
    listColumns: [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "subject", label: "Subject" },
      { key: "handled", label: "Handled", type: "boolean" },
      { key: "created_at", label: "Received", type: "date" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "subject", label: "Subject", type: "text", required: true },
      { name: "message", label: "Message", type: "textarea", rows: 6, required: true },
      { name: "handled", label: "Handled", type: "boolean" },
      { name: "admin_notes", label: "Admin notes", type: "textarea", rows: 3 },
    ],
  },
  {
    key: "newsletter",
    table: "newsletter_subscribers",
    singular: "Newsletter Subscriber",
    plural: "Newsletter Subscribers",
    icon: "MailPlus",
    defaultOrder: { column: "created_at", ascending: false },
    searchColumns: ["email", "source"],
    listColumns: [
      { key: "email", label: "Email" },
      { key: "source", label: "Source" },
      { key: "unsubscribed_at", label: "Unsubscribed", type: "date" },
      { key: "created_at", label: "Subscribed", type: "date" },
    ],
    fields: [
      { name: "email", label: "Email", type: "email", required: true },
      { name: "source", label: "Source", type: "text" },
      { name: "unsubscribed_at", label: "Unsubscribed at", type: "datetime" },
    ],
  },
];

export function getResource(key: string): ResourceConfig | undefined {
  return RESOURCES.find((r) => r.key === key);
}
