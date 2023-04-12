export const updatePatientMutation = `
mutation UpdatePatient($input: UpdatePatientInput!) {
  updatePatient(input: $input) {
    code
    success
    patient {
      id
    }
  }
}
`
