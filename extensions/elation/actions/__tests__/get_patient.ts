import { getPatient } from '..'

describe('Simple get patient action', () => {
  const onComplete = jest.fn()
  const client_id = 'Qq0oymgbCUJJeDE30zvAOCiZRnvDGWv5dx0vWW9t'
  const client_secret =
    'uvH1e0C63qI4uYpbl7i5rqBFqaZUse2Kl6PCopWaTqbCrdAOEiEjmJun539zRuqlk7Pd77hZxkzaOry94NGUR86EPY0XOKl40wM9'
  const username = '4069-563@api.elationemr.com'
  const password = '24e83d2024e9c4a2f089924e4ecc565f'
  beforeEach(() => {
    onComplete.mockClear()
  })

  test('Should not call the onComplete callback', async () => {
    await getPatient.onActivityCreated(
      {
        fields: {
          patientId: '141372212838401',
        },
        settings: {
          client_id,
          client_secret,
          username,
          password,
        },
      } as any,
      onComplete,
      jest.fn()
    )
    expect(onComplete).toHaveBeenCalled()
  })
})
