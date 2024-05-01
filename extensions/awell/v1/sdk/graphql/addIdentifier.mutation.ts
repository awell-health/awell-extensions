export const addIdentifierToPatientMutation = `
mutation AddIdentifierToPatient($input: AddIdentifierToPatientInput!) {
    addIdentifierToPatient(input: $input) {
      success
      code
      patient {
        id
      }
    }
  }
`
