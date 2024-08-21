import { pipelines } from './pipelines/pipelines.js'
import { chunk } from './chunks/chunks.js'
import { upload } from './uploads/uploads.js'
import { tool } from './tools/tools.js'
import { chat } from './chats/chats.js'
import { document } from './documents/documents.js'
import { user } from './users/users.js'
import { parser } from './parser/parser.js'

export const services = (app) => {
  app.configure(pipelines)

  app.configure(parser)
  app.configure(user)
  app.configure(chunk)
  app.configure(document)
  app.configure(upload)
  app.configure(tool)
  app.configure(chat)

  // All services will be registered here
}
