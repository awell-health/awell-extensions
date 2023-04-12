export const createPatientMutation = `
mutation CreatePatient($input: CreatePatientInput!) {
  createPatient(input: $input) {
    patient {
      id
    }
  }
}
`
