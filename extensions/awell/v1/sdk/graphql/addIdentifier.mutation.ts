export const addIdentifierToPatientMutation = `
mutation AddIdentifierToPatient($input: AddIdentifierToPatientInput!) {
    addIdentifierToPatient(input: $input) {
      patient {
        id
      }
    }
  }
`
