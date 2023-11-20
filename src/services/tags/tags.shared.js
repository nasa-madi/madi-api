export const tagsPath = 'tags'

export const tagsMethods = ['find', 'get', 'create', 'patch', 'remove']

export const tagsClient = (client) => {
  const connection = client.get('connection')

  client.use(tagsPath, connection.service(tagsPath), {
    methods: tagsMethods
  })
}
