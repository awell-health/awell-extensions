export const patientPathwaysQuery = `
query GetPatientPathways($patient_id: String!, $status: [String!]) {
    patientPathways(
      patient_id: $patient_id
      filters: { status: { in: $status } }
    ) {
      success
      patientPathways {
        id
        title
        pathway_definition_id
        status
        status_explanation
        version
        release_id
        baseline_info {
          value
          definition {
            id
            title
            category
            key
            valueType
            possibleValues {
              label
              value
            }
            unit
            range {
              min
              max
            }
          }
        }
      }
    }
  }  
`
