/**
 * TODO: write tests
 * Uncomment what is below as it's a good start
 */

import { submitQuestionnaireResponse } from '.'
import { generateTestPayload } from '../../../../src/tests'
// import { mockSettings } from '../../__mocks__'

// jest.mock('@medplum/core', () => {
//   // eslint-disable-next-line @typescript-eslint/no-var-requires
//   const { MedplumClient: MedplumMockClient } = require('../../__mocks__')

//   return {
//     MedplumClient: MedplumMockClient,
//   }
// })

describe('Medplum - Submit questionnaire response', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should submit a questionnaire response', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        patientId: 'patient-id',
      },
      settings: {
        clientId: 'a578f41d-be4d-48e9-801a-d969f80d4c3a',
        clientSecret:
          'e6a0356298ff86ba07dd8660b1f17cb395648852f2563649e38f85c0e6df21a3',
        awellApiUrl:
          'https://api.development.awellhealth.com/orchestration/m2m/graphql',
        awellApiKey: '59bQf06crzUinBB4T4oATZC9W3Hy0uKF',
      },
      pathway: {
        id: 'uWjPgEzAdmnS',
      },
      activity: {
        id: '5p9NNIdP2Wj_Srobbqb6V',
      },
    })

    await submitQuestionnaireResponse.onActivityCreated(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalled()
  })
})
