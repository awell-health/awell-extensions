import { isNil } from 'lodash'

export const extractIdFromLocationHeader = (response: any): string => {
  const locationHeader = response.headers.location
  if (isNil(locationHeader)) throw new Error('Location header not found.')

  const id = locationHeader.match(/\/([^/]+)\/_history/)?.[1]
  if (isNil(id)) throw new Error('ID not found in location header.')
  return id
}
