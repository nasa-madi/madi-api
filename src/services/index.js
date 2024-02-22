// import { sharedAi } from './shared-ai/shared-ai.js'
// import { chunks } from './chunks/chunks.js'
// import { upload } from './uploads/uploads.js'
import { tool } from './tools/tools.js'
import { chat } from './chats/chats.js'
// import { document } from './documents/documents.js'
import { user } from './users/users.js'
// import { blob } from './blobs/blobs.js'

export const services = (app) => {
  // app.configure(sharedAi)
  // app.configure(blob)
  // app.configure(chunks)
  // app.configure(upload)
  app.configure(tool)
  app.configure(chat)
  // app.configure(document)
  app.configure(user)
  // All services will be registered here
}
