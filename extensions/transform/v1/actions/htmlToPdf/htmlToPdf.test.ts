import { htmlToPdf as extensionAction } from './htmlToPdf'
import { generateTestPayload } from '@/tests'
import * as htmlToPdfHelper from '../../../../../src/utils/htmlToPdf/htmlToBase64Pdf'
import { TestHelpers } from '@awell-health/extensions-core'
import { ZodError } from 'zod'

describe('Transform - htmlToPdf', () => {
  const htmlToBase64PdfSpy = jest
    .spyOn(htmlToPdfHelper, 'htmlToBase64Pdf')
    .mockImplementation(async (_: string) => 'base64string')

  const {
    onComplete,
    onError,
    helpers,
    extensionAction: htmlToPdf,
    clearMocks,
  } = TestHelpers.fromAction(extensionAction)

  beforeEach(() => {
    clearMocks()
    htmlToBase64PdfSpy.mockClear()
  })

  test('Should return the expected base64 PDF', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        htmlString: 'hello-world',
      },
      settings: {},
    })

    await htmlToPdf.onEvent({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
    })

    expect(htmlToBase64PdfSpy).toHaveBeenCalledWith('hello-world', undefined)

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        base64Pdf: 'base64string',
      },
    })
  })

  test('Should throw error when htmlString is empty', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        htmlString: '',
      },
      settings: {},
    })

    const resp = htmlToPdf.onEvent({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
    })

    await expect(resp).rejects.toThrow(ZodError)
    expect(htmlToBase64PdfSpy).not.toHaveBeenCalled()
  })

  test('Should pass options to htmlToBase64Pdf', async () => {
    const options = {
      format: 'A4',
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    }

    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        htmlString: 'hello-world',
        options,
      },
      settings: {},
    })

    await htmlToPdf.onEvent({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
    })

    expect(htmlToBase64PdfSpy).toHaveBeenCalledWith('hello-world', options)
  })
})
