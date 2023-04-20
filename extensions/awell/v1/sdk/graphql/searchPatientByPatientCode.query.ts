export const searchPatientByPatientCodeQuery = `
query SearchPatientsByPatientCode($patient_code: String!) {
    searchPatientsByPatientCode(patient_code: $patient_code) {
      success
      patients {
        id
      }
    }
  }
`
