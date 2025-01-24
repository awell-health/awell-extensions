export const patientReadMock = {
  resourceType: 'Patient',
  id: '12724067',
  identifier: [
    {
      use: 'usual',
      type: {
        text: 'CERNER',
      },
      system: 'urn:oid:1.2.840.114350.1.13.0.1.7.5.737384.0',
      value: 'E11629',
    },
  ],
  active: true,
  name: [
    {
      use: 'official',
      text: 'Nick Test',
      family: 'Test',
      given: ['Nick'],
    },
    {
      use: 'usual',
      text: 'Nick Test',
      family: 'Test',
      given: ['Nick'],
    },
  ],
  telecom: [
    {
      system: 'email',
      value: 'nick@awellhealth.com',
      rank: 1,
    },
  ],
  gender: 'male',
  birthDate: '1993-11-30',
  deceasedBoolean: false,
  address: [
    {
      use: 'home',
      line: ['100 Milky Way', 'Learning Campus'],
      city: 'Verona',
      state: 'WI',
      postalCode: '53593',
      period: {
        start: '2025-01-20',
      },
    },
  ],
}
