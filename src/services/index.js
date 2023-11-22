import { document } from './documents/documents.js'
import { user } from './users/users.js'

export const services = (app) => {
  app.configure(document)
  app.configure(user)

  // All services will be registered here
}