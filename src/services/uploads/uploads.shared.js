export const uploadsPath = 'uploads'

export const uploadsMethods = [
  // 'find', 
  'get',
  'create', 
  // 'patch', 
  'remove'
]

export const uploadsClient = (client) => {
  const connection = client.get('connection')

  client.use(uploadsPath, connection.service(uploadsPath), {
    methods: uploadsMethods
  })
}
