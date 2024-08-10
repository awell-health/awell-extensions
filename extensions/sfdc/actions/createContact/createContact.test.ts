import { createContact } from '.'
import { generateTestPayload } from '../../../../src/tests'
import { mockSettings } from '../../api/__mocks__'
import { mockCreateContactResponse } from '../../api/__mocks__'

jest.mock('../../api/client')

describe('Salesforce - Create contact', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should create a contact', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        contactKey: 'test@awellhealth.com',
        attributeSets: JSON.stringify([
          {
            name: 'Email Addresses',
            items: [
              {
                values: [
                  {
                    name: 'Email Address',
                    value: 'test@awellhealth.com',
                  },
                  {
                    name: 'HTML Enabled',
                    value: true,
                  },
                ],
              },
            ],
          },
        ]),
      },
      settings: mockSettings,
    })

    await createContact.onActivityCreated(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        contactId: String(mockCreateContactResponse.contactId),
      },
    })
  })
})
