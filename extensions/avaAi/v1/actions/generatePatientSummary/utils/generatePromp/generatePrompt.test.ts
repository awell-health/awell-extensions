import { Sex } from '../../../../../../awell/gql/graphql'
import { generatePrompt, promptQuestion } from './generatePrompt'

describe('Generate prompt for patient summary', () => {
  test('Should generate a prompt with all characteristics', async () => {
    const result = generatePrompt({
      id: 'patient-id',
      profile: {
        first_name: 'Nick',
        last_name: 'Hellemans',
        address: {
          street: 'John Doe Street 20',
          city: 'Kontich',
          country: 'Belgium',
          state: 'Antwerp',
          zip: '2550',
        },
        birth_date: '1993-11-30',
        email: 'john.doe@awellhealth.com',
        mobile_phone: '+32 xxx xx xx xx',
        phone: '+32 xxx xx xx xx',
        national_registry_number: '123456789',
        patient_code: '98765',
        preferred_language: 'en',
        sex: Sex.Male,
      },
    })

    expect(result).toBe(`${promptQuestion}

Characteristic: first_name
Value: Nick

Characteristic: last_name
Value: Hellemans

Characteristic: birth_date
Value: 1993-11-30

Characteristic: email
Value: john.doe@awellhealth.com

Characteristic: mobile_phone
Value: +32 xxx xx xx xx

Characteristic: phone
Value: +32 xxx xx xx xx

Characteristic: national_registry_number
Value: 123456789

Characteristic: patient_code
Value: 98765

Characteristic: preferred_language
Value: en

Characteristic: sex
Value: MALE

Characteristic: street
Value: John Doe Street 20

Characteristic: city
Value: Kontich

Characteristic: country
Value: Belgium

Characteristic: state
Value: Antwerp

Characteristic: zip
Value: 2550`)
  })

  test('Should generate a prompt with only a subset of characteristics', async () => {
    const result = generatePrompt(
      {
        id: 'patient-id',
        profile: {
          first_name: 'Nick',
          last_name: 'Hellemans',
          address: {
            street: 'John Doe Street 20',
            city: 'Kontich',
            country: 'Belgium',
            state: 'Antwerp',
            zip: '2550',
          },
          birth_date: '1993-11-30',
          email: 'john.doe@awellhealth.com',
          mobile_phone: '+32 xxx xx xx xx',
          phone: '+32 xxx xx xx xx',
          national_registry_number: '123456789',
          patient_code: '98765',
          preferred_language: 'en',
          sex: Sex.Male,
        },
      },
      ['first_name', 'email', 'street', 'non_existing_char', '']
    )

    expect(result).toBe(`${promptQuestion}

Characteristic: first_name
Value: Nick

Characteristic: email
Value: john.doe@awellhealth.com

Characteristic: street
Value: John Doe Street 20`)
  })

  test('Should generate a prompt with only with characteristics that are defined', async () => {
    const result = generatePrompt(
      {
        id: 'patient-id',
        profile: {
          first_name: 'Nick',
          //   last_name: 'Hellemans'
          sex: undefined,
          email: 'john.doe@awellhealth.com',
          address: {
            street: undefined,
          },
        },
      },
      ['first_name', 'last_name', 'sex', 'email', 'street']
    )

    expect(result).toBe(`${promptQuestion}

Characteristic: first_name
Value: Nick

Characteristic: email
Value: john.doe@awellhealth.com`)
  })
})
