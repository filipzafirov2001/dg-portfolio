import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'archivePhoto',
  title: 'Archive Photo',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      }
    }),
    defineField({
      name: 'category',
      title: 'Category / Location',
      type: 'string',
    }),
    defineField({
      name: 'dateTaken',
      title: 'Date Taken',
      type: 'date',
    }),
  ]
})
