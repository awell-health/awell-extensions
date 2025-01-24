// import axios, {
//   type AxiosResponse,
//   type AxiosInstance,
//   type InternalAxiosRequestConfig,
//   AxiosHeaders,
// } from 'axios'
// import {
//   type PatientReadInputType,
//   type PatientReadResponseType,
//   type PatientCreateInputType,
//   type PatientCreateResponseType,
//   type PatientMatchInputType,
//   type PatientMatchResponseType,
//   type DocumentReferenceCreateInputType,
//   type DocumentReferenceCreateResponseType,
//   type AppointmentReadResponseType,
//   type AppointmentReadInputType,
//   type PatientSearchInputType,
//   type PatientSearchResponseType,
// } from './schema'
// import { endsWith, isNil } from 'lodash'

// /**
//  * FHIR R4 API Client
//  */
// export class CernerFhirR4Client {
//   private readonly client: AxiosInstance

//   private readonly authUrl: string
//   private readonly clientId: string
//   private readonly privateKey: string
//   private accessToken: string | null = null
//   private tokenExpiry: number | null = null // Store token expiry time in UNIX timestamp

//   constructor({
//     baseUrl,
//     authUrl,
//     clientId,
//     privateKey,
//   }: {
//     baseUrl: string
//     authUrl: string
//     clientId: string
//     privateKey: string
//   }) {
//     this.authUrl = authUrl
//     this.clientId = clientId
//     this.privateKey = privateKey

//     this.client = axios.create({
//       baseURL: new URL(
//         'FHIR/R4/',
//         endsWith(baseUrl, '/') ? baseUrl : `${baseUrl}/`,
//       ).toString(),
//       headers: new AxiosHeaders({
//         'Content-Type': 'application/json',
//       }),
//     })

//     this.client.interceptors.request.use(
//       async (
//         config: InternalAxiosRequestConfig,
//       ): Promise<InternalAxiosRequestConfig> => {
//         if (isNil(this.accessToken) || this.isTokenExpired()) {
//           await this.refreshAccessToken()
//         }

//         // Add the Authorization header to the request
//         if (!isNil(this.accessToken)) {
//           config.headers = AxiosHeaders.from(config?.headers ?? {})
//           config.headers.set('Authorization', `Bearer ${this.accessToken}`)
//         }

//         return config
//       },
//     )
//   }

//   private async refreshAccessToken(): Promise<void> {
//     try {
//       const tokenResponse = await axios.post<{
//         access_token: string
//         expires_in: number
//         scope: string
//       }>(
//         this.authUrl,
//         {
//           grant_type: 'client_credentials',
//           client_assertion_type:
//             'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
//           client_assertion: generateJWT(
//             this.clientId,
//             this.authUrl,
//             this.privateKey,
//           ),
//         },
//         {
//           headers: {
//             'Content-Type': 'application/x-www-form-urlencoded',
//           },
//         },
//       )

//       this.accessToken = tokenResponse.data.access_token
//       this.tokenExpiry =
//         Math.floor(Date.now() / 1000) + tokenResponse.data.expires_in // Current time + expiry
//     } catch (error) {
//       console.error('Failed to refresh access token:', error)
//       throw new Error('Unable to refresh access token')
//     }
//   }

//   private isTokenExpired(): boolean {
//     const now = Math.floor(Date.now() / 1000) // Current time in seconds
//     return (
//       isNil(this.tokenExpiry) || now >= this.tokenExpiry - 60 // Refresh 1 minute before expiry
//     )
//   }

//   async getPatient(
//     resourceId: PatientReadInputType,
//   ): Promise<AxiosResponse<PatientReadResponseType>> {
//     const url = new URL(`Patient/${resourceId}`, this.client.defaults.baseURL)

//     const response = await this.client.get<PatientReadResponseType>(
//       url.toString(),
//     )

//     return response
//   }

//   async createPatient(
//     data: PatientCreateInputType,
//   ): Promise<AxiosResponse<PatientCreateResponseType>> {
//     const url = new URL(`Patient`, this.client.defaults.baseURL)

//     const response = await this.client.post<PatientReadResponseType>(
//       url.toString(),
//       data,
//     )

//     return response
//   }

//   async matchPatient(
//     data: PatientMatchInputType,
//   ): Promise<AxiosResponse<PatientMatchResponseType>> {
//     const url = new URL(`Patient/$match`, this.client.defaults.baseURL)

//     const response = await this.client.post<PatientMatchResponseType>(
//       url.toString(),
//       data,
//     )

//     return response
//   }

//   async searchPatient(
//     data: PatientSearchInputType,
//   ): Promise<AxiosResponse<PatientSearchResponseType>> {
//     const url = new URL(`Patient`, this.client.defaults.baseURL)

//     const response = await this.client.get<PatientSearchResponseType>(
//       `${url.toString()}?identifier=MRN|${data.MRN}`,
//     )

//     return response
//   }

//   async createDocumentReference(
//     data: DocumentReferenceCreateInputType,
//   ): Promise<AxiosResponse<DocumentReferenceCreateResponseType>> {
//     const url = new URL(`DocumentReference`, this.client.defaults.baseURL)

//     const response =
//       await this.client.post<DocumentReferenceCreateResponseType>(
//         url.toString(),
//         data,
//       )

//     return response
//   }

//   async getAppointment(
//     resourceId: AppointmentReadInputType,
//   ): Promise<AxiosResponse<AppointmentReadResponseType>> {
//     const url = new URL(
//       `Appointment/${resourceId}`,
//       this.client.defaults.baseURL,
//     )

//     const response = await this.client.get<AppointmentReadResponseType>(
//       url.toString(),
//     )

//     return response
//   }
// }
