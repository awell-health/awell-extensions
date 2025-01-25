import { type Patient } from '@medplum/fhirtypes'

export interface PatientMatchInputType {
  resourceType: 'Parameters'
  parameter: [
    {
      name: 'resource'
      resource: Partial<Patient>
    },
    {
      name: 'onlyCertainMatches'
      valueBoolean: 'true' | 'false'
    },
  ]
}

export interface PatientMatchResponseType {
  resourceType: 'Bundle'
  type: 'searchset'
  total: number
  link: unknown
  entry: [
    {
      link: unknown
      fullUrl: string
      resource: Partial<Patient>
      search: {
        extension: [
          {
            valueCode: 'certain' | 'probable' | 'possible' | 'certainly-not'
            url: 'http://hl7.org/fhir/StructureDefinition/match-grade'
          },
        ]
        mode: 'match'
        score: number
      }
    },
  ]
}
