export const getPatientByIdentifierQuery = `
query GetPatientByIdentifier($system: String!, $value: String!) {
    patientByIdentifier(system: $system, value: $value) {
      patient {
        id
        profile {
          identifier {
            system
            value
          }
          email
          first_name
          last_name
          name
          sex
          birth_date
          phone
          mobile_phone
          preferred_language
          patient_code
          national_registry_number
          address {
            street
            city
            zip
            state
            country
          }
        }
      }
    }
  }
`
