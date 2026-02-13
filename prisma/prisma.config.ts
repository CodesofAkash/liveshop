import type { Config } from 'prisma'

const config: Config = {
  schema: './prisma/schema.prisma',
  output: './node_modules/.prisma/client',
  generate: {
    previewFeatures: ['fullTextSearch', 'fullTextIndex'],
  },
}

export default config


// import 'dotenv/config';
// import { defineConfig, env } from 'prisma/config';

// export default defineConfig({
//   schema: 'prisma/schema.prisma',
//   migrations: { 
//     path: 'prisma/migrations',
//     seed: 'tsx prisma/seed.ts',
//   },
//   datasource: {
//     url: env('DATABASE_URL'),
//     // @ts-ignore - directUrl is valid in Prisma 7 but types not updated
//     directUrl: env('DIRECT_URL')
//   },
// });