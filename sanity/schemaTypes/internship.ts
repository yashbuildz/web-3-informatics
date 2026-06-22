export default {
  name: 'internship',
  title: 'Internship',
  type: 'document',
  groups: [
    { name: 'basic',   title: 'Basic Info' },
    { name: 'content', title: 'Page Content' },
    { name: 'meta',    title: 'Ratings & Flags' },
  ],
  fields: [

    // ── Basic Info ────────────────────────────────────────────────────────────
    {
      name: 'title', title: 'Title', type: 'string', group: 'basic',
      description: 'e.g. "AI & Machine Learning Internship"',
      validation: (R: any) => R.required(),
    },
    {
      name: 'slug', title: 'Slug (URL)', type: 'slug', group: 'basic',
      description: 'Auto-generated from title. Used in the page URL.',
      options: { source: 'title', maxLength: 96 },
    },
    {
      name: 'domain', title: 'Domain', type: 'string', group: 'basic',
      options: { list: ['Artificial Intelligence','Web Development','Data Science','Design','Cybersecurity','Marketing','Blockchain','Management','Cloud','Mobile Dev','Computer Science'] },
      validation: (R: any) => R.required(),
    },
    {
      name: 'duration', title: 'Duration', type: 'string', group: 'basic',
      description: 'e.g. "8 weeks"',
      validation: (R: any) => R.required(),
    },
    {
      name: 'tier', title: 'Tier', type: 'string', group: 'basic',
      options: { list: ['Free','Pro','Elite'], layout: 'radio' },
      validation: (R: any) => R.required(),
    },
    {
      name: 'price', title: 'Price (₹)', type: 'number', group: 'basic',
      description: 'Set 0 for Free tier',
      validation: (R: any) => R.required().min(0),
    },
    {
      name: 'mode', title: 'Mode', type: 'string', group: 'basic',
      options: { list: ['Remote','Hybrid','On-site'], layout: 'radio' },
      validation: (R: any) => R.required(),
    },
    {
      name: 'seats', title: 'Seats Available', type: 'number', group: 'basic',
      validation: (R: any) => R.required().min(0),
    },
    {
      name: 'startDate', title: 'Start Date', type: 'string', group: 'basic',
      description: 'e.g. "May 1" or "June 15, 2025"',
    },
    {
      name: 'icon', title: 'Emoji Icon', type: 'string', group: 'basic',
      description: 'Single emoji shown on the card e.g. 🤖 💻 📊',
    },
    {
      name: 'bgClass', title: 'Card Background Color', type: 'string', group: 'basic',
      options: { list: ['bg-violet','bg-blue','bg-emerald','bg-pink','bg-amber','bg-rose','bg-cyan','bg-orange','bg-sky','bg-green'] },
    },
    {
      name: 'image', title: 'Hero Cover Image', type: 'image', group: 'basic',
      description: 'Optional. If set, replaces the gradient on the detail page hero.',
      options: { hotspot: true },
    },

    // ── Ratings & Flags ───────────────────────────────────────────────────────
    {
      name: 'rating', title: 'Rating (0–5)', type: 'number', group: 'meta',
      validation: (R: any) => R.min(0).max(5),
    },
    {
      name: 'reviews', title: 'Review Count', type: 'number', group: 'meta',
    },
    {
      name: 'hot', title: 'Mark as Hot 🔥', type: 'boolean', group: 'meta',
      initialValue: false,
    },
    {
      name: 'isNew', title: 'Mark as New ✨', type: 'boolean', group: 'meta',
      initialValue: false,
    },
    {
      name: 'certificate', title: 'Certificate Included?', type: 'boolean', group: 'meta',
      initialValue: true,
    },

    // ── Page Content ──────────────────────────────────────────────────────────
    {
      name: 'skills',
      title: 'Skills (shown on card + detail page)',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'content',
      description: 'e.g. Python, TensorFlow, SQL',
    },
    {
      name: 'description',
      title: 'About this internship',
      type: 'text',
      group: 'content',
      rows: 5,
      description: 'Shown in the "About this internship" section on the detail page.',
    },
    {
      name: 'highlights',
      title: "What you'll gain",
      type: 'array',
      of: [{ type: 'string' }],
      group: 'content',
      description: 'Each item is a bullet point under "What you\'ll gain". e.g. "Build 3 real-world projects"',
    },
    {
      name: 'curriculum',
      title: 'Curriculum (week by week)',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'content',
      description: 'Each item is one week/module. e.g. "Week 1–2: Python & NumPy"',
    },
    {
      name: 'mentors',
      title: 'Mentors',
      type: 'array',
      group: 'content',
      description: 'Add mentors who guide students in this internship.',
      of: [{
        type: 'object',
        name: 'mentor',
        title: 'Mentor',
        fields: [
          { name: 'name',   title: 'Full Name', type: 'string' },
          { name: 'role',   title: 'Role / Title', type: 'string', description: 'e.g. "Senior ML Engineer"' },
          { name: 'avatar', title: 'Photo', type: 'image', options: { hotspot: true } },
        ],
        preview: {
          select: { title: 'name', subtitle: 'role' },
        },
      }],
    },
    {
      name: 'faqs',
      title: 'FAQs',
      type: 'array',
      group: 'content',
      description: 'Frequently asked questions shown at the bottom of the detail page.',
      of: [{
        type: 'object',
        name: 'faq',
        title: 'FAQ',
        fields: [
          { name: 'question', title: 'Question', type: 'string', validation: (R: any) => R.required() },
          { name: 'answer',   title: 'Answer',   type: 'text',   rows: 3, validation: (R: any) => R.required() },
        ],
        preview: {
          select: { title: 'question' },
        },
      }],
    },
  ],

  preview: {
    select: { title: 'title', subtitle: 'domain', media: 'image' },
    prepare({ title, subtitle, media }: any) {
      return { title, subtitle, media }
    },
  },
}