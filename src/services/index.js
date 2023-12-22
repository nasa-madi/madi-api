import { chunks } from './chunks/chunks.js'

import { upload } from './uploads/uploads.js'

import { tool } from './tools/tools.js'

import { chat } from './chats/chats.js'

import { document } from './documents/documents.js'
import { user } from './users/users.js'

export const services = (app) => {
  app.configure(chunks)

  app.configure(upload)

  app.configure(tool)

  app.configure(chat)

  app.configure(document)
  app.configure(user)

  // All services will be registered here
}
