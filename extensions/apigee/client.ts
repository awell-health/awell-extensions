import { GoogleAuth } from 'google-auth-library'
import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  AxiosHeaders,
} from 'axios'
import { isNil } from 'lodash'

export class ApigeeApiClient {
  private readonly client: AxiosInstance
  private readonly auth: GoogleAuth
  private accessToken: string | null = null

  constructor() {
    this.auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    })

    this.client = axios.create({
      baseURL: 'https://apigee.googleapis.com/v1/',
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
      }),
    })

    this.client.interceptors.request.use(
      async (
        config: InternalAxiosRequestConfig,
      ): Promise<InternalAxiosRequestConfig> => {
        if (isNil(this.accessToken)) {
          await this.refreshAccessToken()
        }

        if (!isNil(this.accessToken)) {
          config.headers = AxiosHeaders.from(config?.headers ?? {})
          config.headers.set('Authorization', `Bearer ${this.accessToken}`)
        }

        return config
      },
    )
  }

  private async refreshAccessToken(): Promise<void> {
    try {
      const accessToken = await this.auth.getAccessToken()
      this.accessToken = accessToken ?? null
    } catch (error) {
      console.error('Failed to get access token:', error)
      throw new Error('Unable to get access token')
    }
  }

  async getAccessToken(): Promise<string> {
    if (isNil(this.accessToken)) {
      await this.refreshAccessToken()
    }
    if (isNil(this.accessToken)) {
      throw new Error('Failed to obtain access token')
    }
    return this.accessToken!
  }

  async listApis(apigeeOrgId: string): Promise<{ proxies: string[] }> {
    const response = await this.client.get(`organizations/${apigeeOrgId}/apis`)
    return response.data
  }

  async listProxiesWithDeployments(apigeeOrgId: string): Promise<{
    proxies: Array<{
      name: string
      revisions: string[]
      deployments: Array<{
        environment: string
        revision: string
        state: string
      }>
    }>
  }> {
    const proxiesResponse = await this.client.get(`organizations/${apigeeOrgId}/apis`)

    const proxies = proxiesResponse.data.proxies ?? []

    const proxiesWithDeployments = await Promise.all(
      proxies.map(async (proxyName: string) => {
        const [revisionsResponse, deploymentsResponse] = await Promise.all([
          this.client.get(`organizations/${apigeeOrgId}/apis/${proxyName}/revisions`),
          this.client.get(`organizations/${apigeeOrgId}/apis/${proxyName}/deployments`)
        ])

        const revisions = revisionsResponse.data.revision ?? []
        const deployments = deploymentsResponse.data.environment ?? []

        return {
          name: proxyName,
          revisions,
          deployments: deployments.map((env: any) => ({
            environment: env.name ?? '',
            revision: env.revision?.[0]?.name ?? '',
            state: env.state ?? 'unknown'
          }))
        }
      })
    )

    return { proxies: proxiesWithDeployments }
  }

  async listApiProducts(apigeeOrgId: string): Promise<{
    apiProducts: Array<{
      name: string
      displayName: string
      description: string
      environments: string[]
      proxies: string[]
      scopes: string[]
      approvalType: string
    }>
  }> {
    const response = await this.client.get(`organizations/${apigeeOrgId}/apiproducts`)
    const products = response.data.apiProduct ?? []

    const detailedProducts = await Promise.all(
      products.map(async (productName: string) => {
        const productResponse = await this.client.get(
          `organizations/${apigeeOrgId}/apiproducts/${productName}`
        )
        const product = productResponse.data
        
        return {
          name: product.name ?? '',
          displayName: product.displayName ?? product.name ?? '',
          description: product.description ?? '',
          environments: product.environments ?? [],
          proxies: product.proxies ?? [],
          scopes: product.scopes ?? [],
          approvalType: product.approvalType ?? 'auto'
        }
      })
    )

    return { apiProducts: detailedProducts }
  }

  async ensureDeveloper(apigeeOrgId: string, email: string, firstName: string, lastName: string): Promise<{
    developerId: string
    email: string
    status: string
    created: boolean
  }> {
    try {
      const response = await this.client.get(`organizations/${apigeeOrgId}/developers/${email}`)
      return {
        developerId: response.data.developerId ?? response.data.email ?? email,
        email: response.data.email ?? email,
        status: response.data.status ?? 'active',
        created: false
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        const createResponse = await this.client.post(`organizations/${apigeeOrgId}/developers`, {
          email,
          firstName,
          lastName,
          userName: email
        })
        return {
          developerId: createResponse.data.developerId ?? createResponse.data.email ?? email,
          email: createResponse.data.email ?? email,
          status: createResponse.data.status ?? 'active',
          created: true
        }
      }
      throw error
    }
  }

  async createDeveloperAppAndApproveKey(apigeeOrgId: string, developerId: string, appName: string, apiProducts: string[]): Promise<{
    appId: string
    keyId: string
    consumerKey: string
    consumerSecret: string
    boundProducts: string[]
  }> {
    try {
      const existingResponse = await this.client.get(`organizations/${apigeeOrgId}/developers/${developerId}/apps/${appName}`)
      const credentials = existingResponse.data.credentials?.[0]
      return {
        appId: existingResponse.data.appId ?? appName,
        keyId: credentials?.consumerKey ?? '',
        consumerKey: credentials?.consumerKey ?? '',
        consumerSecret: credentials?.consumerSecret ?? '',
        boundProducts: credentials?.apiProducts?.map((p: any) => p.apiproduct ?? '') ?? []
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        const createResponse = await this.client.post(`organizations/${apigeeOrgId}/developers/${developerId}/apps`, {
          name: appName,
          apiProducts
        })
        const credentials = createResponse.data.credentials?.[0]
        return {
          appId: createResponse.data.appId ?? appName,
          keyId: credentials?.consumerKey ?? '',
          consumerKey: credentials?.consumerKey ?? '',
          consumerSecret: credentials?.consumerSecret ?? '',
          boundProducts: apiProducts
        }
      }
      throw error
    }
  }

  async rotateKeyWithOverlap(apigeeOrgId: string, developerId: string, appId: string, overlapHours: number = 24): Promise<{
    oldKeyId: string
    newKeyId: string
    overlapEndsAt: string
  }> {
    const appResponse = await this.client.get(`organizations/${apigeeOrgId}/developers/${developerId}/apps/${appId}`)
    const oldKey = appResponse.data.credentials?.[0]?.consumerKey ?? ''
    
    const newKeyResponse = await this.client.post(`organizations/${apigeeOrgId}/developers/${developerId}/apps/${appId}/keys`, {
      consumerKey: '',
      consumerSecret: ''
    })
    
    const overlapEndsAt = new Date(Date.now() + overlapHours * 60 * 60 * 1000).toISOString()
    
    await this.client.put(`organizations/${apigeeOrgId}/developers/${developerId}/apps/${appId}/keys/${String(oldKey)}`, {
      expiresAt: Date.now() + overlapHours * 60 * 60 * 1000
    })
    
    return {
      oldKeyId: oldKey,
      newKeyId: newKeyResponse.data.consumerKey ?? '',
      overlapEndsAt
    }
  }

  async revokeKeyOrSuspendApp(apigeeOrgId: string, developerId: string, appId: string, keyId?: string): Promise<{
    action: 'key_revoked' | 'app_suspended'
    timestamp: string
  }> {
    const timestamp = new Date().toISOString()
    
    if (keyId != null) {
      await this.client.delete(`organizations/${apigeeOrgId}/developers/${developerId}/apps/${appId}/keys/${keyId}`)
      return {
        action: 'key_revoked',
        timestamp
      }
    } else {
      await this.client.put(`organizations/${apigeeOrgId}/developers/${developerId}/apps/${appId}`, {
        status: 'revoked'
      })
      return {
        action: 'app_suspended',
        timestamp
      }
    }
  }

  async kvmGet(apigeeOrgId: string, environment: string, mapName: string, key: string): Promise<{
    value: string
  }> {
    const response = await this.client.get(`organizations/${apigeeOrgId}/environments/${environment}/keyvaluemaps/${mapName}/entries/${key}`)
    return {
      value: response.data.value ?? ''
    }
  }

  async kvmSet(apigeeOrgId: string, environment: string, mapName: string, key: string, value: string): Promise<{
    success: boolean
  }> {
    await this.client.post(`organizations/${apigeeOrgId}/environments/${environment}/keyvaluemaps/${mapName}/entries`, {
      name: key,
      value
    })
    return {
      success: true
    }
  }

  async deploymentStatusSnapshot(apigeeOrgId: string): Promise<{
    snapshots: Array<{
      proxy: string
      revision: string
      environments: Array<{
        name: string
        state: string
        lastChange: string
      }>
    }>
  }> {
    const proxiesResponse = await this.client.get(`organizations/${apigeeOrgId}/apis`)
    const proxies = proxiesResponse.data.proxies ?? []
    
    const snapshots = await Promise.all(
      proxies.map(async (proxyName: string) => {
        const deploymentsResponse = await this.client.get(`organizations/${apigeeOrgId}/apis/${proxyName}/deployments`)
        const deployments = deploymentsResponse.data.environment ?? []
        
        return {
          proxy: proxyName,
          revision: deployments[0]?.revision?.[0]?.name ?? '',
          environments: deployments.map((env: any) => ({
            name: env.name ?? '',
            state: env.state ?? 'unknown',
            lastChange: env.revision?.[0]?.lastModifiedAt ?? new Date().toISOString()
          }))
        }
      })
    )
    
    return { snapshots }
  }

  async opsSnapshot(apigeeOrgId: string, environment: string): Promise<{
    oneHour: { total: number, errorRate: number, p95: number }
    twentyFourHour: { total: number, errorRate: number, p95: number }
  }> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const now = new Date().toISOString()
    
    const [oneHourResponse, twentyFourHourResponse] = await Promise.all([
      this.client.get(`organizations/${apigeeOrgId}/environments/${environment}/stats/apis?select=sum(message_count),avg(total_response_time),sum(is_error)&timeRange=${oneHourAgo}~${now}&timeUnit=hour`),
      this.client.get(`organizations/${apigeeOrgId}/environments/${environment}/stats/apis?select=sum(message_count),avg(total_response_time),sum(is_error)&timeRange=${twentyFourHoursAgo}~${now}&timeUnit=day`)
    ])
    
    const parseStats = (response: any): { total: number, errorRate: number, p95: number } => {
      const stats = response.data.environments?.[0]?.dimensions?.[0]?.metrics ?? []
      const total = stats.find((m: any) => m.name === 'sum(message_count)')?.values?.[0] ?? 0
      const errors = stats.find((m: any) => m.name === 'sum(is_error)')?.values?.[0] ?? 0
      const p95 = stats.find((m: any) => m.name === 'avg(total_response_time)')?.values?.[0] ?? 0
      
      return {
        total: Number(total),
        errorRate: total > 0 ? Number(errors) / Number(total) : 0,
        p95: Number(p95)
      }
    }
    
    return {
      oneHour: parseStats(oneHourResponse),
      twentyFourHour: parseStats(twentyFourHourResponse)
    }
  }
}
