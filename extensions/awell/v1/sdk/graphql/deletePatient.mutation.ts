export const deletePatientMutation = `
mutation DeletePatient($input: DeletePatientInput!) {
  deletePatient(input: $input) {
    success
  }
}
`
