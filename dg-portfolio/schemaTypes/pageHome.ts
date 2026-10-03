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
    defineField({
      name: 'heroBackdrop',
      title: 'Hero Backdrop Image',
      description: 'Background image revealed behind the hero panels as you scroll',
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
      placeholder: 'Photography is more than just pressing a button; it is the art of seeing and preserving atmosphere. Every frame in this collection represents patience—waiting for the perfect light, the subtle gesture, and the quiet harmony between subject and space. Rather than a flat sequence of pictures, these series capture the tactile weight of each environment and moment.'
    }),
    defineField({
      name: 'introText2',
      title: 'Paragraph 2',
      type: 'text',
      group: 'intro',
      placeholder: 'Rooted in analog disciplines and refined through digital precision, each study explores texture, depth, and shadow. A single shutter release condenses natural light, genuine emotion, and the stillness of time into an enduring visual narrative.'
    }),

    // --- GALLERY ---
    defineField({
      name: 'galleryHeading',
      title: 'Gallery Heading',
      type: 'string',
      group: 'gallery',
      placeholder: 'Selected Works & Studies'
    }),
    defineField({
      name: 'galleryDescription',
      title: 'Gallery Description',
      type: 'text',
      group: 'gallery',
      placeholder: 'Every photo holds a story. Explore selected captures spanning natural landscapes, architecture, and fleeting moments from recent series.'
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
