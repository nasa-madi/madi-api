class AiInterface {
  constructor(options) {
    this.options = options;
  }
}


// This is a skeleton for a custom service class. Remove or add the methods you need here
export class SharedAiServiceInterface {
  constructor(options) {
    this.options = options
  }

  async embedding() {
    // add your implementation here
    throw new Error('embedding method is not implemented');
  }

  async create(data, params) {
    // add your implementation here
    throw new Error('create method is not implemented');
  }

}

export const getOptions = (app) => {
  return { app }
}
