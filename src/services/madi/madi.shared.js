export const madiPath = 'madi'

export const madiMethods = [
  // 'find', 'get', 
  'create', 
  // 'patch', 'remove'
]

export const madiClient = (client) => {
  const connection = client.get('connection')

  client.use(madiPath, connection.service(madiPath), {
    methods: madiMethods
  })
}
