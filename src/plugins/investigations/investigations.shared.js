export const investigationsPath = 'investigations'

export const investigationsMethods = ['find', 'get', 'create', 'patch', 'remove']

export const investigationsClient = (client) => {
  const connection = client.get('connection')

  client.use(investigationsPath, connection.service(investigationsPath), {
    methods: investigationsMethods
  })
}
