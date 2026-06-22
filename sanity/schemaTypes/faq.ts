import { defineField, defineType } from 'sanity'

export default defineType({
  name:  'faq',
  title: 'FAQ',
  type:  'document',
  icon:  () => '❓',
  fields: [
    defineField({
      name:       'question',
      title:      'Question',
      type:       'string',
      validation: R => R.required(),
    }),
    defineField({
      name:       'answer',
      title:      'Answer',
      type:       'text',
      rows:       4,
      validation: R => R.required(),
    }),
    defineField({
      name:         'order',
      title:        'Display Order',
      description:  'Lower number = appears first',
      type:         'number',
      initialValue: 99,
    }),
  ],
  preview: {
    select: { title: 'question' },
    prepare: ({ title }) => ({ title }),
  },
  orderings: [
    {
      title: 'Display Order',
      name:  'orderAsc',
      by:    [{ field: 'order', direction: 'asc' }],
    },
  ],
})