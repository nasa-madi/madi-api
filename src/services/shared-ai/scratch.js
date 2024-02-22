let TypeBoxSchemaInput = {
  messages: Type.Array(
  Type.Object({
    role:Type.String(),
    content:Type.Union([Type.Null(), Type.String()])
  })),
  model: Type.Optional(Type.String()),
  frequency_penalty: Type.Optional(Type.Number()),
  logit_bias: Type.Optional(Type.Object({})),
  max_tokens: Type.Optional(Type.Integer()),
  n: Type.Optional(Type.Integer()),
  presence_penalty: Type.Optional(Type.Number()),
  response_format: Type.Optional(Type.Object({ type: Type.String() })),
  seed: Type.Optional(Type.Integer()),
  stop: Type.Optional(Type.Union([Type.String(), Type.Array(Type.String())])),
  stream: Type.Optional(Type.Boolean()),
  temperature: Type.Optional(Type.Number({ minimum: 0, maximum: 2 })),
  top_p: Type.Optional(Type.Number()),
  tools: Type.Optional(Type.Array(Type.Object({}))),
  tool_choice: Type.Optional(Type.Union([
    Type.Union([
      Type.Literal('auto'),
      Type.Literal('none'),
    ]),
    Type.Object({
      type: Type.Literal('function'),
      function: Type.Object({
        name: Type.String(),
      }, { required: ['name'] }),
    }),
  ]))
}


let TypeBoxSchemaOutput = {
  contents: Type.Array(
    Type.Object({
      role: Type.String(),
      parts: Type.Array(Type.Object({
        text: Type.Optional(Type.String()),
        functionCall: Type.Optional(Type.Object({
          name: Type.String(),
          args: Type.Optional(Type.Object({})),
        })),
        functionResponse: Type.Optional(Type.Object({
          name: Type.String(),
          response: Type.Object({}),
        })),
      })),
    }),
  ),
  tools: Type.Array(Type.Object({
    functionDeclarations: Type.Array(Type.Object({
      name: Type.String(),
      description: Type.String(),
      parameters: Type.Object({
        type: Type.String(),
        properties: Type.Object({}),
        required: Type.Array(Type.String()),
      }),
    })),
  })),
}