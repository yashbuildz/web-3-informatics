import { defineField, defineType } from 'sanity'

export default defineType({
  name:  'partner',
  title: 'Partner Company',
  type:  'document',
  icon:  () => '🏢',
  fields: [
    defineField({
      name:  'name',
      title: 'Company Name',
      type:  'string',
      validation: R => R.required(),
    }),
    defineField({
      name:    'logo',
      title:   'Logo Image',
      type:    'image',
      options: { hotspot: true },
    }),
    defineField({
      name:  'website',
      title: 'Website URL',
      type:  'url',
    }),
    defineField({
      name:         'order',
      title:        'Display Order',
      description:  'Lower number = appears first in marquee',
      type:         'number',
      initialValue: 99,
    }),
  ],
  preview: {
    select: { title: 'name', media: 'logo' },
    prepare: ({ title, media }) => ({ title, media }),
  },
  orderings: [
    {
      title: 'Display Order',
      name:  'orderAsc',
      by:    [{ field: 'order', direction: 'asc' }],
    },
  ],
})