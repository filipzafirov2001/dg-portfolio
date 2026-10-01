import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'homeGallery',
  title: 'Home Page Gallery',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Gallery Title',
      type: 'string',
      initialValue: 'Featured Highlights',
    }),
    defineField({
      name: 'photos',
      title: 'Featured Photos (Mass Upload Dropzone)',
      description: 'Drag & drop multiple images here all at once to upload!',
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
          ],
        },
      ],
    }),
  ],
})
