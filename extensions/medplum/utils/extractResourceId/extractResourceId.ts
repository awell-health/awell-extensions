import { type ResourceType } from '@medplum/fhirtypes'
export const extractResourceId = (
  input: string,
  resource: ResourceType
): string | null => {
  const match = input.match(/(?:Patient\/)?(\w+)$/)

  return (match != null) ? match[1] : null
}
