import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

// Custom desk structure to enforce Singletons for Settings and Pages
const myStructure = (S: any) =>
  S.list()
    .title('Portfolio Content')
    .items([
      S.listItem()
        .title('Global Settings')
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
            .title('Global Settings')
        ),
      S.divider(),
      S.listItem()
        .title('Home Page')
        .child(
          S.document()
            .schemaType('pageHome')
            .documentId('pageHome')
            .title('Home Page')
        ),
      S.listItem()
        .title('Archive Page')
        .child(
          S.document()
            .schemaType('pageArchive')
            .documentId('pageArchive')
            .title('Archive Page')
        ),
    ])

export default defineConfig({
  name: 'default',
  title: 'DG Portfolio Studio',

  projectId: 'ofwq40vv',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: myStructure,
    }),
    visionTool()
  ],

  schema: {
    types: schemaTypes,
  },
})
