import { type AxiosError } from 'axios'
import { addClinicalDocument } from '.'
import { generateTestPayload } from '@/tests'
import { mockSettings } from '../../api/__mocks__/mockData'
import * as helpers from '../../helpers'

jest.mock('../../api/client')

describe('athenahealth - Add clinical document', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()
  jest
    .spyOn(helpers, 'htmlToBase64Pdf')
    .mockImplementation(async (_: string) => 'base64string')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test.skip('Should add a document to the patient chart', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        departmentid: '1',
        patientid: '27083',
        attachmentcontents: '<p>Hello world</p>',
      },
      settings: mockSettings,
    })

    await addClinicalDocument.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalled()
  })

  test('Should return an error when the patient does not exist', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        departmentid: '1',
        patientid: '99999999999',
        attachmentcontents: '<p>Hello world</p>',
      },
      settings: mockSettings,
    })

    try {
      await addClinicalDocument.onActivityCreated!(
        mockOnActivityCreateParams,
        onComplete,
        onError
      )
    } catch (error) {
      const axiosError = error as AxiosError
      expect(axiosError.response).toBeDefined()
      expect(axiosError.response?.status).toBe(400)
      expect(axiosError.response?.data).toStrictEqual({
        detailedmessage:
          'The specified patient does not exist in that department.',
        error: 'The specified patient does not exist in that department.',
      })
    }

    expect(onComplete).not.toHaveBeenCalled()
  })

  test('Should return an error when practice does not exist', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        departmentid: '1',
        patientid: '1',
        attachmentcontents: '<p>Hello world</p>',
      },
      settings: { ...mockSettings, practiceId: '99999999999' },
    })

    try {
      await addClinicalDocument.onActivityCreated!(
        mockOnActivityCreateParams,
        onComplete,
        onError
      )
    } catch (error) {
      const axiosError = error as AxiosError
      expect(axiosError.response).toBeDefined()
      expect(axiosError.response?.status).toBe(404)
      expect(axiosError.response?.data).toStrictEqual({
        error: 'Invalid practice.',
        detailedmessage: 'The practice ID does not exist.',
      })
    }

    expect(onComplete).not.toHaveBeenCalled()
  })
})
