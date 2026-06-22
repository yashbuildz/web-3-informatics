import { defineField, defineType } from 'sanity'

export default defineType({
  name:  'ctaSection',
  title: 'CTA Banner (Homepage)',
  type:  'document',
  icon:  () => '🚀',
  fields: [
    defineField({
      name:       'heading',
      title:      'Heading',
      type:       'string',
      validation: R => R.required(),
    }),
    defineField({
      name:  'subheading',
      title: 'Subheading',
      type:  'text',
      rows:  2,
    }),

    // ── Primary button ──
    defineField({
      name:         'primaryLabel',
      title:        'Primary Button Label',
      type:         'string',
      initialValue: 'Browse internships',
    }),
    defineField({
      name:         'primaryHref',
      title:        'Primary Button Link',
      type:         'string',
      initialValue: '/internships',
    }),

    // ── Secondary button ──
    defineField({
      name:  'secondaryLabel',
      title: 'Secondary Button Label (optional)',
      type:  'string',
    }),
    defineField({
      name:  'secondaryHref',
      title: 'Secondary Button Link',
      type:  'string',
    }),

    // ── Stats ──
    defineField({ name: 'stat1Value', title: 'Stat 1 — Value', type: 'string', initialValue: '2,400+' }),
    defineField({ name: 'stat1Label', title: 'Stat 1 — Label', type: 'string', initialValue: 'Students placed' }),
    defineField({ name: 'stat2Value', title: 'Stat 2 — Value', type: 'string', initialValue: '98%' }),
    defineField({ name: 'stat2Label', title: 'Stat 2 — Label', type: 'string', initialValue: 'Completion rate' }),
    defineField({ name: 'stat3Value', title: 'Stat 3 — Value', type: 'string', initialValue: '4.9★' }),
    defineField({ name: 'stat3Label', title: 'Stat 3 — Label', type: 'string', initialValue: 'Average rating' }),
  ],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({ title: title || '🚀 CTA Section' }),
  },
})