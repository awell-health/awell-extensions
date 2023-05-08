type Factory<T> = (new () => T) | (() => T) | (() => Promise<T>)

export class ServiceContainer<ServiceName extends string> {
  private readonly services: Map<ServiceName, Factory<unknown>>
  private readonly instances: Map<ServiceName, unknown>

  constructor() {
    this.services = new Map()
    this.instances = new Map()
  }

  register<T>(serviceName: ServiceName, serviceFactory: Factory<T>): void {
    this.services.set(serviceName, serviceFactory)
  }

  async get<T>(serviceName: ServiceName): Promise<T> {
    const instance = this.instances.get(serviceName) as T
    if (instance != null) {
      return instance
    }

    const factory = this.services.get(serviceName) as Factory<T>
    if (factory == null) {
      throw new Error(`Factory for ${serviceName} was not registered`)
    }

    if (factory.prototype?.constructor != null) {
      return new (factory as new () => T)()
    }

    return await (factory as (() => T) | (() => Promise<T>))()
  }
}
