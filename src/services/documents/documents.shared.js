export const documentsPath = 'documents'

export const documentsMethods = ['find', 'get', 'create', 'patch', 'remove']

export const documentsClient = (client) => {
  const connection = client.get('connection')

  client.use(documentsPath, connection.service(documentsPath), {
    methods: documentsMethods
  })
}
