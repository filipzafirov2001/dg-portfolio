import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'pageHome',
  title: 'Home Page',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Hero Section' },
    { name: 'showcase', title: 'Showcase Section' },
    { name: 'intro', title: 'Introduction Section' },
    { name: 'gallery', title: 'Gallery Section' },
  ],
  fields: [
    // --- HERO ---
    defineField({
      name: 'heroTitle',
      title: 'Main Title',
      type: 'string',
      group: 'hero',
      placeholder: 'Dario Gorgiev'
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Subtitle',
      type: 'string',
      group: 'hero',
      placeholder: 'PHOTOGRAPHY'
    }),
    defineField({
      name: 'heroDescription',
      title: 'Description',
      type: 'string',
      group: 'hero',
      placeholder: 'A personal portfolio showcasing my selected works.'
    }),
    defineField({
      name: 'heroPolaroid',
      title: 'Polaroid Image',
      type: 'image',
      group: 'hero',
      options: { hotspot: true }
    }),
    
    // --- SHOWCASE ---
    defineField({
      name: 'showcaseHeading',
      title: 'Showcase Heading',
      type: 'string',
      group: 'showcase',
      placeholder: 'Cinematic perspectives from the field'
    }),
    defineField({
      name: 'showcaseCaption',
      title: 'Showcase Caption',
      type: 'text',
      group: 'showcase',
      placeholder: 'A short visual reel capturing the atmosphere and tone of my recent analog work.'
    }),
    defineField({
      name: 'showcaseVideo',
      title: 'Showcase Video',
      type: 'file',
      group: 'showcase',
      options: { accept: 'video/*' }
    }),

    // --- INTRO ---
    defineField({
      name: 'introHeading',
      title: 'Introduction Heading',
      type: 'string',
      group: 'intro',
      placeholder: 'Today I am presenting my curated portfolio, a collection of moments frozen in time.'
    }),
    defineField({
      name: 'introImage',
      title: 'Introduction Image',
      type: 'image',
      group: 'intro',
      options: { hotspot: true }
    }),
    defineField({
      name: 'introImageCaption',
      title: 'Image Caption',
      type: 'string',
      group: 'intro',
      placeholder: 'The photographer\'s camera, always ready for the next shot.'
    }),
    defineField({
      name: 'introText1',
      title: 'Paragraph 1',
      type: 'text',
      group: 'intro',
      placeholder: 'Photography is more than just pressing a button. It is the art of seeing. Every image in this collection represents hours of patience, waiting for the perfect light, the right expression, the decisive moment. A conventional portfolio shows you a flat list of images. This collection shows you terrain: ridges with heights, valleys with depths, and a horizon you can orbit.'
    }),
    defineField({
      name: 'introText2',
      title: 'Paragraph 2',
      type: 'text',
      group: 'intro',
      placeholder: 'It is the result of years of practice. Press the shutter for under a second, and it returns a memory accurate to half a micron, with true color, the lighting it was found in, and a place on the map.'
    }),

    // --- GALLERY ---
    defineField({
      name: 'galleryHeading',
      title: 'Gallery Heading',
      type: 'string',
      group: 'gallery',
      placeholder: 'One map of the visual world'
    }),
    defineField({
      name: 'galleryDescription',
      title: 'Gallery Description',
      type: 'text',
      group: 'gallery',
      placeholder: 'Every photo is a story. Browse the collection below to explore different themes and subjects. From sweeping vistas to macro details. You can walk from lichen on a Cairngorm boulder to frost on a Helsinki window without leaving a square millimetre.'
    }),
    defineField({
      name: 'galleryPhotos',
      title: 'Gallery Photos',
      description: 'Drag & drop multiple images here',
      type: 'array',
      group: 'gallery',
      options: { layout: 'grid' },
      of: [{ type: 'image', options: { hotspot: true }, fields: [{ name: 'title', title: 'Caption', type: 'string' }] }]
    })
  ]
})
