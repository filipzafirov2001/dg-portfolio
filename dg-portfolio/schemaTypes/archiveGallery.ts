import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'archiveGallery',
  title: 'Full Archive Collection',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Archive Title',
      type: 'string',
      initialValue: 'Full Collection',
    }),
    defineField({
      name: 'photos',
      title: 'Archive Photos (Mass Upload Dropzone)',
      description: 'Drag & drop as many images as you want here all at once!',
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
