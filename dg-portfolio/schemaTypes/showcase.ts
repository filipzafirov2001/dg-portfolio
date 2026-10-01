import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'showcase',
  title: 'Showcase Section',
  type: 'document',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'text',
    }),
    defineField({
      name: 'videoFile',
      title: 'Showcase Video',
      type: 'file',
      options: {
        accept: 'video/*'
      }
    }),
  ]
})
