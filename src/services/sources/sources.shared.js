export const sourcesPath = 'sources'

export const sourcesMethods = ['find', 'get', 'create', 'patch', 'remove']

export const sourcesClient = (client) => {
  const connection = client.get('connection')

  client.use(sourcesPath, connection.service(sourcesPath), {
    methods: sourcesMethods
  })
}
