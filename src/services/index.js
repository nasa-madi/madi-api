import { uploads } from './uploads/uploads.js'

import { user } from './users/users.js'

import { madi } from './madi/madi.js'

import { sources } from './sources/sources.js'

import { tags } from './tags/tags.js'

import { documents } from './documents/documents.js'

import { investigations } from './investigations/investigations.js'

export const services = (app) => {
  app.configure(uploads)

  app.configure(user)

  app.configure(madi)

  app.configure(sources)

  app.configure(tags)

  app.configure(documents)

  app.configure(investigations)

  // All services will be registered here
}
