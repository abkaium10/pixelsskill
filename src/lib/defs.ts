/** Single source of truth for CMS forms, validation and API behaviour (client + server safe: no imports of server code). */
export type FieldType = "text" | "textarea" | "number" | "checkbox" | "select" | "media" | "video" | "datetime" | "slug" | "url" | "money" | "markdown" | "relation" | "tags" | "list";
export type Field = {
  name: string; label: string; type: FieldType; tab?: string; hint?: string; placeholder?: string;
  required?: boolean; max?: number; min?: number; options?: { value: string; label: string }[];
  from?: string;                 // slug source field
  relation?: { model: "service"; label: string }; // relation select source
  fields?: Field[]; itemLabel?: string; maxItems?: number; // list
  child?: { model: string; fk: string };           // list persisted as child table rows
  nullable?: boolean; default?: unknown; publishRequired?: boolean;
};

const f = (type: FieldType) => (name: string, label: string, extra: Partial<Field> = {}): Field => ({ name, label, type, ...extra });
export const text = f("text"), area = f("textarea"), num = f("number"), chk = f("checkbox"), sel = f("select"), media = f("media"), video = f("video"),
  dt = f("datetime"), slug = f("slug"), url = f("url"), money = f("money"), md = f("markdown"), rel = f("relation"), tags = f("tags"), list = f("list");
const opts = (...v: string[]) => v.map((x) => ({ value: x, label: x }));
export const STATUS = [{ value: "DRAFT", label: "Draft" }, { value: "PUBLISHED", label: "Published" }, { value: "ARCHIVED", label: "Archived" }];
const status = (): Field => sel("status", "Status", { options: STATUS, default: "DRAFT", tab: "Publishing" });
const order = (): Field => num("displayOrder", "Display order", { default: 0, min: 0, max: 100000, tab: "Publishing", hint: "Lower numbers appear first." });
const featured = (): Field => chk("featured", "Featured", { tab: "Publishing" });
const seo = (tab = "SEO"): Field[] => [
  text("seoTitle", "SEO title", { tab, max: 120, hint: "Recommended: about 50–60 characters." }),
  area("metaDescription", "Meta description", { tab, max: 320, hint: "Recommended: about 120–160 characters." }),
  url("canonicalUrl", "Canonical URL", { tab, hint: "Leave empty to use the default URL of this page." }),
  chk("noindex", "noindex (ask search engines not to index this page)", { tab }),
  chk("nofollow", "nofollow (ask search engines not to follow links on this page)", { tab }),
  text("ogTitle", "Social title (Open Graph / X)", { tab, max: 120, hint: "Falls back to the SEO title." }),
  area("ogDescription", "Social description", { tab, max: 300, hint: "Falls back to the meta description." }),
  media("ogImageId", "Social sharing image (1200×630 recommended)", { tab }),
  text("ogImageAlt", "Social image alt text", { tab, max: 200 }),
];
const pageSeo = (): Field[] => seo();

export type Column = { name: string; label: string; kind?: "status" | "money" | "bool" | "date" };
export type Collection = {
  key: string; model: string; label: string; plural: string; titleField: string; fields: Field[]; columns: Column[]; search: string[];
  order: Record<string, "asc" | "desc">[]; hasStatus: boolean; publishedAt?: boolean; publicPath?: (r: { slug?: string }) => string | null;
  requiredToPublish?: string[];
};

export const COLLECTIONS: Record<string, Collection> = {
  pricing: {
    key: "pricing", model: "pricingCard", label: "Pricing card", plural: "Pricing", titleField: "title", hasStatus: true,
    search: ["title", "subtitle"], order: [{ displayOrder: "asc" }, { title: "asc" }], requiredToPublish: ["title", "startingPrice"],
    columns: [{ name: "title", label: "Card" }, { name: "startingPrice", label: "Starting price", kind: "money" }, { name: "featured", label: "Featured", kind: "bool" }, { name: "displayOrder", label: "Order" }, { name: "status", label: "Status", kind: "status" }],
    fields: [
      text("title", "Card title", { required: true, max: 120, tab: "Card details", placeholder: "Clipping Path" }),
      text("subtitle", "Subtitle", { max: 160, tab: "Card details" }),
      area("description", "Short description", { max: 600, tab: "Card details" }),
      text("badge", "Badge text", { max: 40, tab: "Card details", placeholder: "Most popular" }),
      rel("serviceId", "Linked service (optional)", { relation: { model: "service", label: "name" }, tab: "Card details" }),
      sel("currency", "Currency", { options: opts("USD", "EUR", "GBP", "CAD", "AUD"), default: "USD", tab: "Card details" }),
      money("startingPrice", "Starting price", { required: true, tab: "Card details", hint: "Editable placeholder values only — enter your real prices." }),
      text("priceUnit", "Price unit", { default: "per image", max: 40, tab: "Card details" }),
      media("beforeId", "Before image", { tab: "Before / After" }), media("afterId", "After image", { tab: "Before / After" }),
      text("beforeAlt", "Before image alt text", { max: 200, tab: "Before / After" }), text("afterAlt", "After image alt text", { max: 200, tab: "Before / After" }),
      num("sliderPosition", "Slider default position (%)", { default: 50, min: 0, max: 100, tab: "Before / After" }),
      chk("showSlider", "Show before/after slider", { default: true, tab: "Before / After" }),
      list("options", "Pricing options", { tab: "Price options", child: { model: "pricingOption", fk: "cardId" }, itemLabel: "title", maxItems: 100, hint: "Add as many options as you need. They belong to this card only.", fields: [
        text("title", "Option title", { required: true, max: 120 }), area("description", "Description", { max: 400 }),
        money("price", "Price", { required: true }), text("priceUnit", "Price unit", { default: "per image", max: 40 }),
        text("badge", "Badge", { max: 40 }), chk("visible", "Visible on the website", { default: true })] }),
      chk("showStartingPrice", "Show starting price", { default: true, tab: "Display" }), chk("showOptions", "Show price options", { default: true, tab: "Display" }),
      text("ctaLabel", "CTA button label", { default: "Get a Quote", max: 60, tab: "Display" }), url("ctaUrl", "CTA destination", { default: "/quote", tab: "Display" }),
      featured(), order(), status(),
    ],
  },
  portfolio: {
    key: "portfolio", model: "portfolioItem", label: "Portfolio project", plural: "Portfolio", titleField: "title", hasStatus: true, publishedAt: true,
    search: ["title", "category"], order: [{ displayOrder: "asc" }, { title: "asc" }], publicPath: (r) => (r.slug ? `/portfolio/${r.slug}` : null), requiredToPublish: ["title", "beforeId", "afterId"],
    columns: [{ name: "title", label: "Project" }, { name: "category", label: "Category" }, { name: "featured", label: "Featured", kind: "bool" }, { name: "displayOrder", label: "Order" }, { name: "status", label: "Status", kind: "status" }],
    fields: [
      text("title", "Project title", { required: true, max: 140, tab: "General" }), slug("slug", "URL slug", { from: "title", required: true, tab: "General" }),
      area("description", "Short description", { max: 400, tab: "General" }), text("category", "Category", { max: 60, tab: "General", placeholder: "Jewelry" }),
      tags("tags", "Tags (comma separated)", { tab: "General" }), rel("serviceId", "Linked service (optional)", { relation: { model: "service", label: "name" }, tab: "General" }),
      media("beforeId", "Before image", { tab: "Images" }), media("afterId", "After image", { tab: "Images" }),
      text("beforeAlt", "Before image alt text", { max: 200, tab: "Images" }), text("afterAlt", "After image alt text", { max: 200, tab: "Images" }),
      num("sliderPosition", "Slider default position (%)", { default: 50, min: 0, max: 100, tab: "Images" }), media("thumbnailId", "Card thumbnail (optional)", { tab: "Images" }),
      list("examples", "Additional before/after examples", { tab: "Images", child: { model: "portfolioExample", fk: "itemId" }, itemLabel: "caption", maxItems: 100, fields: [
        media("beforeId", "Before image"), media("afterId", "After image"), text("beforeAlt", "Before alt text", { max: 200 }), text("afterAlt", "After alt text", { max: 200 }), text("caption", "Caption", { max: 200 })] }),
      md("body", "Project details", { tab: "Details", max: 20000, hint: "Describe the objective, work performed and result." }),
      ...seo(), featured(), order(), status(),
    ],
  },
  blog: {
    key: "blog", model: "blogPost", label: "Blog post", plural: "Blog", titleField: "title", hasStatus: true, publishedAt: true,
    search: ["title", "category", "authorName"], order: [{ createdAt: "desc" }], publicPath: (r) => (r.slug ? `/blog/${r.slug}` : null), requiredToPublish: ["title", "content", "authorName"],
    columns: [{ name: "title", label: "Post" }, { name: "category", label: "Category" }, { name: "authorName", label: "Author" }, { name: "publishedAt", label: "Published", kind: "date" }, { name: "status", label: "Status", kind: "status" }],
    fields: [
      text("title", "Post title", { required: true, max: 160, tab: "Content" }), slug("slug", "URL slug", { from: "title", required: true, tab: "Content" }),
      area("excerpt", "Excerpt", { max: 400, tab: "Content" }), md("content", "Content", { tab: "Content", max: 100000, hint: "Headings, lists, quotes, links and images are supported. Raw HTML is never rendered." }),
      media("coverId", "Featured image", { tab: "Media" }), text("coverAlt", "Featured image alt text", { max: 200, tab: "Media" }),
      text("authorName", "Author", { max: 100, tab: "Organization", publishRequired: true, hint: "Required to publish. Use the real author's name." }),
      text("category", "Category", { max: 60, tab: "Organization" }), tags("tags", "Tags (comma separated)", { tab: "Organization" }),
      rel("serviceId", "Related service (optional)", { relation: { model: "service", label: "name" }, tab: "Organization" }),
      ...seo(), featured(), status(),
    ],
  },
  testimonials: {
    key: "testimonials", model: "testimonial", label: "Testimonial", plural: "Testimonials", titleField: "name", hasStatus: true,
    search: ["name", "company", "text"], order: [{ displayOrder: "asc" }], requiredToPublish: ["name", "text"],
    columns: [{ name: "name", label: "Name" }, { name: "company", label: "Company" }, { name: "rating", label: "Rating" }, { name: "displayOrder", label: "Order" }, { name: "status", label: "Status", kind: "status" }],
    fields: [
      text("name", "Reviewer name", { required: true, max: 100, tab: "Review" }), text("role", "Role / title", { max: 100, tab: "Review" }), text("company", "Company", { max: 100, tab: "Review" }),
      area("text", "Review text", { required: true, max: 2000, tab: "Review", hint: "Only publish real feedback from real customers." }),
      chk("isSample", "This is a placeholder (shows a “Sample” badge)", { tab: "Review", hint: "Tick this for design placeholders. Untick once it is a real customer review." }),
      num("rating", "Rating (1–5, optional)", { min: 1, max: 5, nullable: true, tab: "Review", hint: "Leave empty unless the customer actually gave a rating." }),
      text("serviceName", "Service they used (optional)", { max: 80, tab: "Review" }),
      media("avatarId", "Avatar (optional)", { tab: "Review" }), text("avatarAlt", "Avatar alt text", { max: 160, tab: "Review" }),
      featured(), order(), status(),
    ],
  },
  faqs: {
    key: "faqs", model: "faq", label: "FAQ", plural: "FAQs", titleField: "question", hasStatus: true,
    search: ["question", "category"], order: [{ category: "asc" }, { displayOrder: "asc" }], requiredToPublish: ["question", "answer"],
    columns: [{ name: "question", label: "Question" }, { name: "category", label: "Category" }, { name: "displayOrder", label: "Order" }, { name: "status", label: "Status", kind: "status" }],
    fields: [
      text("question", "Question", { required: true, max: 240, tab: "FAQ" }), area("answer", "Answer", { required: true, max: 3000, tab: "FAQ" }),
      text("category", "Category", { default: "General", max: 60, tab: "FAQ" }), rel("serviceId", "Linked service (optional)", { relation: { model: "service", label: "name" }, tab: "FAQ" }),
      order(), status(),
    ],
  },
  offers: {
    key: "offers", model: "offer", label: "Offer", plural: "Offers", titleField: "title", hasStatus: true,
    search: ["title"], order: [{ displayOrder: "asc" }], requiredToPublish: ["title"],
    columns: [{ name: "title", label: "Offer" }, { name: "startsAt", label: "Starts", kind: "date" }, { name: "endsAt", label: "Ends", kind: "date" }, { name: "status", label: "Status", kind: "status" }],
    fields: [
      text("title", "Offer title", { required: true, max: 140, tab: "Offer" }), slug("slug", "URL slug", { from: "title", required: true, tab: "Offer" }),
      text("badge", "Badge", { max: 40, tab: "Offer" }), area("description", "Description", { max: 2000, tab: "Offer" }),
      media("bannerId", "Banner image", { tab: "Offer" }), text("bannerAlt", "Banner alt text", { max: 200, tab: "Offer" }),
      dt("startsAt", "Starts at", { nullable: true, tab: "Offer" }), dt("endsAt", "Ends at", { nullable: true, tab: "Offer", hint: "Expired offers are never shown as current." }),
      text("ctaLabel", "CTA label", { default: "Claim this offer", max: 60, tab: "Offer" }), url("ctaUrl", "CTA destination", { default: "/quote", tab: "Offer" }),
      rel("serviceId", "Related service (optional)", { relation: { model: "service", label: "name" }, tab: "Offer" }),
      ...seo(), featured(), order(), status(),
    ],
  },
  redirects: {
    key: "redirects", model: "redirect", label: "Redirect", plural: "Redirects", titleField: "source", hasStatus: false,
    search: ["source", "target"], order: [{ createdAt: "desc" }],
    columns: [{ name: "source", label: "From" }, { name: "target", label: "To" }, { name: "permanent", label: "301", kind: "bool" }, { name: "active", label: "Active", kind: "bool" }],
    fields: [
      text("source", "Source path", { required: true, max: 300, tab: "Redirect", placeholder: "/old-page", hint: "Must start with /. Existing pages take priority over redirects." }),
      text("target", "Destination", { required: true, max: 500, tab: "Redirect", placeholder: "/new-page or https://…", hint: "Internal path or http(s) URL." }),
      chk("permanent", "Permanent (301)", { default: true, tab: "Redirect" }), chk("active", "Active", { default: true, tab: "Redirect" }),
    ],
  },
};

export type Singleton = { key: string; label: string; description: string; fields: Field[]; paths: string[]; route: string; group: "core" | "page" };
const intro = (heading: string, description: string): Field[] => [text("heading", "Page heading", { default: heading, max: 160, tab: "Content" }), area("description", "Intro text", { default: description, max: 800, tab: "Content" })];
const page = (key: string, label: string, path: string, extra: Field[], heading: string, description: string): Singleton => ({ key: `page_${key}`, label, description: `Content and SEO for ${path}`, group: "page", route: `/admin/pages/${key}`, paths: [path], fields: [...intro(heading, description), ...extra, ...pageSeo()] });
const links = (name: string, label: string, tab: string): Field => list(name, label, { tab, itemLabel: "label", maxItems: 50, fields: [text("label", "Label", { required: true, max: 60 }), url("href", "Link (path or URL)", { required: true, max: 300 })] });

export const SINGLETONS: Record<string, Singleton> = {
  homepage: { key: "homepage", label: "Homepage", description: "Hero, section order and content of the homepage", group: "core", route: "/admin/homepage", paths: ["/"], fields: [
    text("heroEyebrow", "Eyebrow label", { tab: "Hero", max: 80 }), text("heroHeading", "Main heading", { tab: "Hero", required: true, max: 160 }), text("heroHighlight", "Highlighted heading text", { tab: "Hero", max: 80 }),
    area("heroDescription", "Description", { tab: "Hero", max: 600 }),
    text("cta1Label", "Primary CTA label", { tab: "Hero", max: 50 }), text("cta1Url", "Primary CTA URL", { tab: "Hero", max: 300 }),
    text("cta2Label", "Secondary CTA label", { tab: "Hero", max: 50 }), text("cta2Url", "Secondary CTA URL", { tab: "Hero", max: 300 }),
    chk("videoEnabled", "Use background video", { tab: "Hero", default: true }), video("heroVideoId", "Background video", { tab: "Hero", hint: "Muted, looping, inline. Pick a short, compressed video." }),
    media("heroPosterId", "Poster image (shown while loading / reduced motion)", { tab: "Hero" }), media("heroMobileId", "Mobile fallback image", { tab: "Hero" }),
    sel("overlay", "Overlay strength", { tab: "Hero", options: [{ value: "light", label: "Light" }, { value: "medium", label: "Medium" }, { value: "strong", label: "Strong" }], default: "medium" }),
    sel("align", "Text alignment", { tab: "Hero", options: [{ value: "left", label: "Left" }, { value: "center", label: "Center" }], default: "left" }),
    list("sections", "Homepage sections (order = order on the page)", { tab: "Sections", itemLabel: "key", maxItems: 30, hint: "Hero is always first and the footer always last.", fields: [
      sel("key", "Section", { options: [["trust", "Trust & highlights"], ["services", "Services"], ["showcase", "Before/after showcase"], ["why", "Why choose us"], ["industries", "Industries we support"], ["how", "How it works"], ["assurance", "How we work with you"], ["portfolio", "Featured portfolio"], ["freetrial", "Free trial promotion"], ["testimonials", "Testimonials"], ["pricing", "Pricing preview"], ["faq", "FAQ"], ["finalcta", "Final CTA"]].map(([value, label]) => ({ value, label })) }),
      chk("enabled", "Visible", { default: true }), text("heading", "Heading", { max: 160 }), area("description", "Description", { max: 600 })] }),
    list("trustItems", "Trust & highlight items", { tab: "Trust", itemLabel: "label", fields: [text("value", "Value", { max: 40 }), text("label", "Label", { required: true, max: 100 })] }),
    list("whyItems", "Why choose us — cards", { tab: "Why us", itemLabel: "title", fields: [text("title", "Title", { required: true, max: 100 }), area("description", "Description", { max: 400 })] }),
    list("steps", "How it works — steps", { tab: "How it works", itemLabel: "title", fields: [text("title", "Title", { required: true, max: 100 }), area("description", "Description", { max: 400 })] }),
    list("industries", "Industries we support", { tab: "Industries", itemLabel: "title", maxItems: 16, fields: [text("title", "Industry", { required: true, max: 80 }), area("description", "Description", { max: 300 }), text("serviceSlug", "Linked service slug", { max: 80, placeholder: "ghost-mannequin" })] }),
    list("assurance", "How we work with you — cards", { tab: "Assurance", itemLabel: "title", maxItems: 8, fields: [text("title", "Title", { required: true, max: 80 }), area("description", "Description", { max: 300 })] }),
    list("marquee", "Scrolling strip words (optional; empty = service names)", { tab: "Hero", itemLabel: "text", maxItems: 20, fields: [text("text", "Text", { required: true, max: 40 })] }),
    text("freeTrialLabel", "Free trial button label", { tab: "CTAs", max: 60 }),
    text("finalLabel", "Final CTA button label", { tab: "CTAs", max: 60 }), url("finalUrl", "Final CTA button URL", { tab: "CTAs" }),
    num("servicesLimit", "Max services shown on homepage", { tab: "CTAs", default: 10, min: 1, max: 100 }), num("portfolioLimit", "Max portfolio projects shown", { tab: "CTAs", default: 6, min: 1, max: 24 }),
    ...pageSeo(),
  ] },
  site: { key: "site", label: "Site settings", description: "Branding, contact details, social links and default SEO", group: "core", route: "/admin/site-settings", paths: ["/"], fields: [
    text("siteName", "Site name", { tab: "Branding", max: 80, default: "PixelSkill" }), text("tagline", "Tagline", { tab: "Branding", max: 160 }),
    media("logoId", "Logo", { tab: "Branding", hint: "Replace the temporary text logo with your real logo." }), text("logoAlt", "Logo alt text", { tab: "Branding", max: 120, default: "PixelSkill" }), media("faviconId", "Favicon", { tab: "Branding" }),
    text("phone", "Phone", { tab: "Contact", max: 40 }), text("email", "Email", { tab: "Contact", max: 160 }), area("address", "Address (optional)", { tab: "Contact", max: 300 }), text("hours", "Business hours (optional)", { tab: "Contact", max: 200 }), url("bookingUrl", "Booking link (Calendly, Cal.com… optional)", { tab: "Contact", hint: "Shows a “Book a call” button on the contact page." }),
    url("facebook", "Facebook URL", { tab: "Social" }), url("instagram", "Instagram URL", { tab: "Social" }), url("linkedin", "LinkedIn URL", { tab: "Social" }), url("youtube", "YouTube URL", { tab: "Social" }), url("x", "X / Twitter URL", { tab: "Social" }), url("whatsapp", "WhatsApp link (https://wa.me/number)", { tab: "Social" }),
    text("seoTitleTemplate", "Title template", { tab: "Default SEO", max: 120, default: "%s | PixelSkill", hint: "%s is replaced by each page's title." }),
    area("defaultDescription", "Default meta description", { tab: "Default SEO", max: 320 }), media("defaultOgImageId", "Default social image", { tab: "Default SEO" }),
    text("plausibleDomain", "Plausible Analytics domain (optional, cookieless)", { tab: "Default SEO", max: 120, placeholder: "pixelskill.com", hint: "Leave empty to disable analytics. Only a bare domain name is accepted." }),
    text("googleVerification", "Google Search Console verification code (optional)", { tab: "Default SEO", max: 120 }),
    text("bingVerification", "Bing Webmaster verification code (optional)", { tab: "Default SEO", max: 120 }),
    text("twitterSite", "X / Twitter handle (optional)", { tab: "Default SEO", max: 40, placeholder: "@pixelskill" }),
    text("orgLegalName", "Organization legal name (for structured data)", { tab: "Default SEO", max: 120 }),
    tags("extraDisallow", "Extra paths to block in robots.txt (comma separated)", { tab: "Default SEO", hint: "Each path must start with /. /admin and /api/ are always blocked." }),
    text("trustBar", "Top-bar message (optional)", { tab: "Top bar", max: 160, hint: "Only enter claims you can substantiate." }),
    text("announcement", "Announcement bar text (optional)", { tab: "Top bar", max: 200 }), url("announcementUrl", "Announcement link (optional)", { tab: "Top bar" }),
  ] },
  chat: { key: "chat", label: "Live chat", description: "Welcome message, quick replies and behaviour of the chat widget", group: "core", route: "/admin/chat-settings", paths: ["/"], fields: [
    chk("enabled", "Enable live chat widget", { tab: "Widget", default: true }),
    text("title", "Chat window title", { tab: "Widget", max: 60, default: "Chat with PixelSkill" }),
    area("welcomeMessage", "Automatic welcome message", { tab: "Messages", max: 600, required: true, hint: "Sent automatically as the first message when a new visitor opens the chat." }),
    text("teaser", "Teaser bubble text", { tab: "Messages", max: 120, hint: "Small bubble shown next to the chat button. Leave empty to hide." }),
    num("autoOpenDelay", "Show teaser after (seconds, 0 = never)", { tab: "Messages", default: 8, min: 0, max: 300 }),
    area("autoReply", "Automatic reply after the visitor's first message (optional)", { tab: "Messages", max: 400 }),
    list("quickReplies", "Quick-reply buttons", { tab: "Messages", itemLabel: "text", maxItems: 6, fields: [text("text", "Button text", { required: true, max: 60 })] }),
    chk("askContact", "Ask for name and email before the first message (optional fields)", { tab: "Behaviour", default: true }),
    text("hours", "Typical reply time / hours (shown in the window)", { tab: "Behaviour", max: 160, default: "We usually reply within a few hours." }),
    text("offlineNote", "Note about replies", { tab: "Behaviour", max: 240, default: "Replies appear here. Leave your email if you would like us to follow up." }),
    num("retentionDays", "Delete chats older than (days, 0 = keep until deleted)", { tab: "Behaviour", default: 90, min: 0, max: 3650, hint: "Applied by the optional cleanup endpoint (see README)." }),
  ] },
  editing: { key: "editing", label: "Online editing (AI-ready)", description: "Feature flag and settings for the optional image-editing studio", group: "core", route: "/admin/editing-settings", paths: ["/edit"], fields: [
    chk("enabled", "Enable the online editing studio (/edit)", { tab: "Feature", default: false, hint: "OFF by default. When off, /edit and /api/edit/* return 404." }),
    sel("provider", "Editing provider", { tab: "Feature", default: "manual", options: [{ value: "manual", label: "Manual — our human editors (default)" }, { value: "mock", label: "Mock — returns the upload unchanged (development only)" }, { value: "http", label: "HTTP — send jobs to an external editing service (webhook)" }] }),
    url("webhookUrl", "Webhook URL (HTTP provider, https only)", { tab: "Feature", hint: "Jobs are POSTed here. The secret is read from the EDIT_WEBHOOK_SECRET environment variable." }),
    list("services", "Services available in the studio", { tab: "Services", itemLabel: "serviceSlug", maxItems: 50, hint: "Only services listed and enabled here can be selected. Add a service here to make it available — no code change needed.", fields: [text("serviceSlug", "Service slug", { required: true, max: 80 }), chk("enabled", "Enabled", { default: true }), text("label", "Label shown to visitors (optional)", { max: 80 }), text("note", "Short note (optional)", { max: 160 })] }),
    num("maxFiles", "Max files per job", { tab: "Limits", default: 5, min: 1, max: 20 }),
    area("disclaimer", "Notice shown in the studio", { tab: "Limits", max: 400, default: "Results are produced by our editing workflow. Please review every result before you use it." }),
  ] },
  navigation: { key: "navigation", label: "Navigation & footer", description: "Header links, CTA and footer content", group: "core", route: "/admin/navigation", paths: ["/"], fields: [
    links("navItems", "Main navigation links (shown after “Image Editing”)", "Header"),
    text("ctaLabel", "Header CTA label", { tab: "Header", default: "Get a Quote", max: 40 }), text("ctaUrl", "Header CTA URL", { tab: "Header", default: "/quote", max: 300 }),
    area("footerDescription", "Footer description", { tab: "Footer", max: 400 }),
    list("footerColumns", "Footer columns", { tab: "Footer", itemLabel: "title", maxItems: 8, fields: [text("title", "Column title", { required: true, max: 60 }), links("links", "Links", "")] }),
    links("legalLinks", "Legal links", "Footer"), text("copyright", "Copyright text", { tab: "Footer", max: 160, hint: "Year is added automatically." }),
  ] },
  ...(Object.fromEntries([
    page("about", "About", "/about", [media("heroImageId", "Hero image", { tab: "Content" }), text("heroImageAlt", "Hero image alt text", { tab: "Content", max: 200 }),
      md("story", "Our story", { tab: "Content", max: 8000 }),
      list("mission", "Mission / vision / values cards", { tab: "Values", itemLabel: "title", maxItems: 6, fields: [text("title", "Title", { required: true, max: 60 }), area("description", "Description", { max: 300 })] }),
      list("process", "How we work — steps", { tab: "Process", itemLabel: "title", maxItems: 20, fields: [text("title", "Title", { required: true, max: 100 }), area("description", "Description", { max: 400 })] }),
      list("quality", "Quality checklist", { tab: "Process", itemLabel: "text", maxItems: 12, fields: [text("text", "Check", { required: true, max: 120 })] }),
      list("faqs", "FAQ items", { tab: "FAQ", itemLabel: "question", maxItems: 30, fields: [text("question", "Question", { required: true, max: 240 }), area("answer", "Answer", { required: true, max: 2000 })] }),
      list("values", "Values / mission cards", { tab: "Values", itemLabel: "title", fields: [text("title", "Title", { required: true, max: 100 }), area("description", "Description", { max: 400 })] }),
      list("stats", "Statistics (only verifiable numbers)", { tab: "Values", itemLabel: "label", fields: [text("value", "Value", { max: 40 }), text("label", "Label", { max: 100 })] }),
      list("team", "Team members (optional)", { tab: "Team", itemLabel: "name", fields: [text("name", "Name", { required: true, max: 100 }), text("role", "Role", { max: 100 }), media("photoId", "Photo"), text("photoAlt", "Photo alt text", { max: 160 })] })],
      "About PixelSkill", "A professional image editing service for e-commerce stores, photographers and agencies."),
    page("contact", "Contact", "/contact", [text("formHeading", "Form heading", { tab: "Content", max: 120, default: "Send us a message" }), area("formDescription", "Form description", { tab: "Content", max: 400 }), text("mapEmbedUrl", "Map embed URL (optional, https only)", { tab: "Content", max: 500 })], "Contact us", "Questions about a project? Send a message and we will reply."),
    page("pricing", "Pricing", "/pricing", [area("note", "Pricing note (shown under the cards)", { tab: "Content", max: 600 }), list("factors", "What affects the price — cards", { tab: "Extras", itemLabel: "title", maxItems: 20, fields: [text("title", "Title", { required: true, max: 100 }), area("description", "Description", { max: 400 })] }), list("complexity", "Complexity guide (table)", { tab: "Extras", itemLabel: "level", fields: [text("level", "Level", { required: true, max: 40 }), text("meaning", "What it means", { max: 200 }), text("examples", "Typical examples", { max: 200 })] }), list("volume", "Volume pricing (table)", { tab: "Extras", itemLabel: "batch", fields: [text("batch", "Batch size", { required: true, max: 60 }), text("approach", "Pricing approach", { max: 160 })] }), list("billing", "How billing works — steps", { tab: "Extras", itemLabel: "title", maxItems: 20, fields: [text("title", "Title", { required: true, max: 100 }), area("description", "Description", { max: 400 })] }), list("faqs", "FAQ items", { tab: "FAQ", itemLabel: "question", maxItems: 30, fields: [text("question", "Question", { required: true, max: 240 }), area("answer", "Answer", { required: true, max: 2000 })] })], "Pricing", "Starting prices for our image editing services. Final pricing depends on image complexity and quantity."),
    page("portfolio", "Portfolio", "/portfolio", [], "Portfolio", "Before-and-after examples of our editing work."),
    page("offers", "Offers", "/offers", [list("howItWorks", "How offers work — steps", { tab: "Extras", itemLabel: "title", fields: [text("title", "Title", { required: true, max: 100 }), area("description", "Description", { max: 400 })] }), list("volume", "Volume discount example (table)", { tab: "Extras", itemLabel: "batch", fields: [text("batch", "Batch size", { required: true, max: 60 }), text("discount", "Discount / approach", { max: 120 })] }), md("terms", "Offer terms", { tab: "Extras", max: 4000 }), list("faqs", "FAQ items", { tab: "FAQ", itemLabel: "question", maxItems: 30, fields: [text("question", "Question", { required: true, max: 240 }), area("answer", "Answer", { required: true, max: 2000 })] })], "Current offers", "Active promotions on our services."),
    page("faq", "FAQ", "/faq", [], "Frequently asked questions", "Answers to common questions about our services."),
    page("testimonials", "Reviews page", "/testimonials", [], "Customer reviews", "What sellers, photographers and agencies say about working with us."),
    page("blog", "Blog", "/blog", [tags("topics", "Popular topics (comma separated)", { tab: "Extras" })], "Blog", "Guides and tips on product photo editing."),
    page("services", "Services listing", "/services", [list("guide", "Which service do you need? (table)", { tab: "Extras", itemLabel: "need", maxItems: 30, fields: [text("need", "If you need…", { required: true, max: 160 }), text("serviceSlug", "Service slug", { required: true, max: 80 })] }), list("steps", "How a project works — steps", { tab: "Extras", itemLabel: "title", maxItems: 20, fields: [text("title", "Title", { required: true, max: 100 }), area("description", "Description", { max: 400 })] }), list("industries", "Industries we support", { tab: "Extras", itemLabel: "title", maxItems: 16, fields: [text("title", "Industry", { required: true, max: 80 }), area("description", "Description", { max: 300 }), text("serviceSlug", "Linked service slug", { max: 80 })] }), list("faqs", "FAQ items", { tab: "FAQ", itemLabel: "question", maxItems: 30, fields: [text("question", "Question", { required: true, max: 240 }), area("answer", "Answer", { required: true, max: 2000 })] })], "Image Editing Services", "Drag the divider on any card to compare the original with the edited result."),
    page("quote", "Quote page", "/quote", [area("sideNote", "Side note", { tab: "Content", max: 600 })], "Get a Quote", "Tell us about your images and we will send a tailored quote."),
    page("freetrial", "Free Trial page", "/free-trial", [area("instructions", "Instructions", { tab: "Content", max: 800, default: "Upload 3–10 original images, choose a service and output format, and tell us what you need." })], "Free Trial", "Try our editing on your own images before you commit."),
    page("privacy", "Privacy Policy", "/privacy", [md("body", "Policy text", { tab: "Content", max: 50000 })], "Privacy Policy", ""),
    page("terms", "Terms & Conditions", "/terms", [md("body", "Terms text", { tab: "Content", max: 50000 })], "Terms & Conditions", ""),
    page("cookies", "Cookie Policy", "/cookies", [md("body", "Policy text", { tab: "Content", max: 50000 })], "Cookie Policy", ""),
  ].map((s) => [s.key, s] as const)) as Record<string, Singleton>),
};

export const PAGE_PATH: Record<string, string> = { page_about: "/about", page_contact: "/contact", page_pricing: "/pricing", page_portfolio: "/portfolio", page_offers: "/offers", page_faq: "/faq", page_blog: "/blog", page_testimonials: "/testimonials", page_services: "/services", page_quote: "/quote", page_freetrial: "/free-trial", page_privacy: "/privacy", page_terms: "/terms", page_cookies: "/cookies", homepage: "/" };

export function blank(fields: Field[]): Record<string, unknown> {
  const o: Record<string, unknown> = {};
  for (const fl of fields) {
    if (fl.default !== undefined) o[fl.name] = fl.default;
    else if (fl.type === "checkbox") o[fl.name] = false;
    else if (fl.type === "number") o[fl.name] = fl.nullable ? null : fl.min ?? 0;
    else if (fl.type === "list" || fl.type === "tags") o[fl.name] = [];
    else if (fl.type === "media" || fl.type === "video" || fl.type === "relation" || fl.type === "datetime") o[fl.name] = null;
    else o[fl.name] = "";
  }
  return o;
}
export function walkMediaIds(fields: Field[], data: Record<string, unknown> | undefined, out = new Set<string>()): Set<string> {
  if (!data) return out;
  for (const fl of fields) {
    const v = data[fl.name];
    if ((fl.type === "media" || fl.type === "video") && typeof v === "string" && v) out.add(v);
    if (fl.type === "list" && Array.isArray(v) && fl.fields) for (const it of v) walkMediaIds(fl.fields, it as Record<string, unknown>, out);
  }
  return out;
}

/** Own-property lookups only: a request for "constructor" or "__proto__" must never resolve to an object. */
export const collection = (k: string): Collection | undefined => (Object.hasOwn(COLLECTIONS, k) ? COLLECTIONS[k] : undefined);
export const singleton = (k: string): Singleton | undefined => (Object.hasOwn(SINGLETONS, k) ? SINGLETONS[k] : undefined);
