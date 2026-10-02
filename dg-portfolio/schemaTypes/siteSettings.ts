import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Site Title',
      type: 'string',
      description: 'Used in the nav bar and browser tab'
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
      type: 'string',
      description: 'The small text in the hero section (e.g. ARCHIVE // 35MM)'
    }),
    defineField({
      name: 'heroPolaroid',
      title: 'Hero Polaroid Image',
      type: 'image',
      description: 'The photo inside the polaroid frame in the hero section',
      options: {
        hotspot: true
      }
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
    }),
  ]
})
