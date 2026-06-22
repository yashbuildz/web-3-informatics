export default {
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    { name: 'studentName', title: 'Student Name', type: 'string' },
    { name: 'college', title: 'College', type: 'string' },
    { name: 'review', title: 'Review', type: 'text' },
    { name: 'domain', title: 'Internship Domain', type: 'string' },
    { name: 'photo', title: 'Photo', type: 'image' },
  ],
}