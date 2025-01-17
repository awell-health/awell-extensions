import { AxiosError } from 'axios'

// Helper function to mock AxiosError
export const createAxiosError = (
  status: number,
  statusText: string,
  data: any,
): AxiosError => {
  const response = {
    status: status,
    statusText: statusText,
    data: JSON.parse(data),
  }

  const error = new AxiosError(
    `Request failed with status code ${status}`,
    status.toString(), // This sets the error code, e.g., "400"
    undefined, // This represents the config, but can be left empty for a mock
    undefined, // This represents the request, but can be left empty for a mock
    // @ts-expect-error this is fine for the mock
    response,
  )
  return error
}
