import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'pageArchive',
  title: 'Archive Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      placeholder: 'Complete Archive',
    }),
    defineField({
      name: 'subtitle',
      title: 'Page Subtitle',
      type: 'string',
      placeholder: 'A comprehensive collection of all works.',
    }),
    defineField({
      name: 'photos',
      title: 'Archive Photos (Mass Upload)',
      description: 'Drag & drop as many images as you want here!',
      type: 'array',
      options: {
        layout: 'grid',
      },
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'title',
              title: 'Caption / Title',
              type: 'string',
            },
            {
              name: 'category',
              title: 'Category / Location',
              type: 'string',
            },
          ],
        },
      ],
    }),
  ],
})
