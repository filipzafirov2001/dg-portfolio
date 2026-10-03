import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Global Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Site Title',
      type: 'string',
      description: 'Used in the nav bar and browser tab',
      placeholder: 'DG PHOTOGRAPHY'
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
    }),
    defineField({
      name: 'contactPhone',
      title: 'Contact Phone Number',
      type: 'string',
      placeholder: '+389 72 303 764'
    }),
    defineField({
      name: 'instagramUrl',
      title: 'Instagram URL',
      type: 'url',
    }),
  ]
})
