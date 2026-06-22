import { defineField, defineType } from 'sanity'

export default defineType({
  name:  'certificateSection',
  title: 'Certificate Section (Homepage)',
  type:  'document',
  icon:  () => '🎓',
  fields: [
    defineField({
      name:         'title',
      title:        'Heading',
      type:         'string',
      initialValue: 'Industry-Recognised Certificate',
    }),
    defineField({
      name:         'subtitle',
      title:        'Subheading',
      type:         'string',
      initialValue: 'Your proof of excellence',
    }),
    defineField({
      name:  'description',
      title: 'Description Paragraph',
      type:  'text',
      rows:  3,
    }),
    defineField({
      name:         'badgeText',
      title:        'Badge Text',
      description:  'Small badge shown on the certificate mockup e.g. "Verified"',
      type:         'string',
      initialValue: 'Verified',
    }),
    defineField({
      name:  'features',
      title: 'Feature Bullet Points',
      type:  'array',
      of:    [{ type: 'string' }],
      initialValue: [
        'Verifiable via unique QR code',
        'LinkedIn-ready digital format',
        'Issued within 48 hrs of completion',
        'Recognised by 200+ hiring partners',
      ],
    }),
    defineField({
      name:        'previewImage',
      title:       'Certificate Preview Image',
      description: 'Optional — if left empty, an animated mockup is shown instead',
      type:        'image',
      options:     { hotspot: true },
    }),
  ],
  preview: {
    prepare: () => ({ title: '🎓 Certificate Section' }),
  },
})