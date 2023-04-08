export const deletePathwayMutation = `
mutation DeletePatient($input: DeletePatientInput!) {
  deletePatient(input: $input) {
    success
  }
}
`
