// For more information about this file see https://dove.feathersjs.com/guides/cli/client.html
import { feathers } from '@feathersjs/feathers'
import authenticationClient from '@feathersjs/authentication-client'
import { uploadsClient } from './services/uploads/uploads.shared.js'

import { userClient } from './services/users/users.shared.js'

import { madiClient } from './services/madi/madi.shared.js'

import { sourcesClient } from './services/sources/sources.shared.js'

import { tagsClient } from './services/tags/tags.shared.js'

import { documentsClient } from './services/documents/documents.shared.js'

import { investigationsClient } from './services/investigations/investigations.shared.js'

/**
 * Returns a  client for the api app.
 *
 * @param connection The REST or Socket.io Feathers client connection
 * @param authenticationOptions Additional settings for the authentication client
 * @see https://dove.feathersjs.com/api/client.html
 * @returns The Feathers client application
 */
export const createClient = (connection, authenticationOptions = {}) => {
  const client = feathers()

  client.configure(connection)
  client.configure(authenticationClient(authenticationOptions))
  client.set('connection', connection)

  client.configure(investigationsClient)

  client.configure(documentsClient)

  client.configure(tagsClient)

  client.configure(sourcesClient)

  client.configure(madiClient)

  client.configure(userClient)

  client.configure(uploadsClient)

  return client
}
