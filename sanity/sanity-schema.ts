// sanity-schema.ts
// ─────────────────────────────────────────────────────────────────────────────
// Add this to your Sanity schema so applications are stored and viewable
// in Sanity Studio.
//
// HOW TO ADD:
//   1. Copy this file into your Sanity Studio project (e.g. schemas/application.ts)
//   2. Import and add it to your schema index:
//
//      // schemas/index.ts
//      import application from './application'
//      export const schemaTypes = [internship, application, ...]
//
//   3. Run `sanity deploy` or restart your studio dev server.
//   4. You'll now see "Application" in your Studio content list.
// ─────────────────────────────────────────────────────────────────────────────

import { defineField, defineType } from 'sanity'

export default defineType({
  name:  'application',
  title: 'Application',
  type:  'document',

  // Studio icon (uses emoji as a simple icon)
  icon: () => '📋',

  fields: [
    defineField({
      name:  'internship',
      title: 'Internship',
      type:  'reference',
      to:    [{ type: 'internship' }],
      validation: Rule => Rule.required(),
    }),

    defineField({
      name:  'status',
      title: 'Status',
      type:  'string',
      options: {
        list: [
          { title: '⏳ Pending',    value: 'pending'    },
          { title: '👀 Reviewing',  value: 'reviewing'  },
          { title: '✅ Accepted',   value: 'accepted'   },
          { title: '❌ Rejected',   value: 'rejected'   },
        ],
        layout: 'radio',
      },
      initialValue: 'pending',
    }),

    defineField({
      name:  'name',
      title: 'Full Name',
      type:  'string',
      validation: Rule => Rule.required(),
    }),

    defineField({
      name:  'email',
      title: 'Email',
      type:  'string',
      validation: Rule => Rule.required().email(),
    }),

    defineField({
      name:  'phone',
      title: 'Phone Number',
      type:  'string',
    }),

    defineField({
      name:  'college',
      title: 'College / University',
      type:  'string',
    }),

    defineField({
      name:  'year',
      title: 'Year of Study',
      type:  'string',
    }),

    defineField({
      name:  'skills',
      title: 'Selected Skills',
      type:  'array',
      of:    [{ type: 'string' }],
    }),

    defineField({
      name:  'why',
      title: 'Motivation',
      type:  'text',
      rows:  6,
      validation: Rule => Rule.required().min(40),
    }),

    defineField({
      name:  'portfolio',
      title: 'Portfolio / GitHub Link',
      type:  'url',
    }),

    defineField({
      name:  'appliedAt',
      title: 'Applied At',
      type:  'datetime',
      readOnly: true,
    }),

    defineField({
      name:  'notes',
      title: 'Internal Notes',
      type:  'text',
      rows:  3,
      description: 'Private notes for your team — never shown to the applicant.',
    }),
  ],

  // How documents appear in Studio lists
  preview: {
    select: {
      title:    'name',
      subtitle: 'internship.title',
      status:   'status',
      date:     'appliedAt',
    },
    prepare({ title, subtitle, status, date }) {
      const statusEmoji: Record<string, string> = {
        pending:   '⏳',
        reviewing: '👀',
        accepted:  '✅',
        rejected:  '❌',
      }
      const emoji = statusEmoji[status] ?? '📋'
      const dateStr = date
        ? new Date(date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
        : ''
      return {
        title:    `${emoji} ${title}`,
        subtitle: subtitle ? `${subtitle} · ${dateStr}` : dateStr,
      }
    },
  },

  // Default sort in Studio: newest first
  orderings: [
    {
      title: 'Applied (newest)',
      name:  'appliedAtDesc',
      by:    [{ field: 'appliedAt', direction: 'desc' }],
    },
    {
      title: 'Applied (oldest)',
      name:  'appliedAtAsc',
      by:    [{ field: 'appliedAt', direction: 'asc' }],
    },
  ],
})