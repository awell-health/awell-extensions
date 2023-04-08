export const updatePatientMutation = `
mutation UpdatePatient($input: UpdatePatientInput!) {
  updatePatient(input: $input) {
    patient {
      id
    }
  }
}
`
