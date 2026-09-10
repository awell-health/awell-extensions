import { htmlToPdf as extensionAction } from './htmlToPdf'
import { generateTestPayload } from '@/tests'
import * as htmlToPdfHelper from '../../../../../src/utils/htmlToPdf/htmlToBase64Pdf'
import { TestHelpers } from '@awell-health/extensions-core'

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
      attempt: 1,
    })

    expect(htmlToBase64PdfSpy).toHaveBeenCalledWith('hello-world', undefined)

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        base64Pdf: 'base64string',
      },
    })
  })

  test('Should call onError when htmlString is empty', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        htmlString: '',
      },
      settings: {},
    })

    await htmlToPdf.onEvent({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onError).toHaveBeenCalledWith({
      events: [
        expect.objectContaining({
          error: expect.objectContaining({
            category: 'SERVER_ERROR',
            message: expect.any(String),
          }),
        }),
      ],
    })
    expect(onComplete).not.toHaveBeenCalled()
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
      attempt: 1,
    })

    expect(htmlToBase64PdfSpy).toHaveBeenCalledWith('hello-world', options)
  })

  test('Should parse options when Awell delivers them as a JSON string', async () => {
    const options = {
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
    }

    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        htmlString: 'hello-world',
        options: JSON.stringify(options),
      },
      settings: {},
    })

    await htmlToPdf.onEvent({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onError).not.toHaveBeenCalled()
    expect(htmlToBase64PdfSpy).toHaveBeenCalledWith('hello-world', options)
  })

  test('Should fail validation when options is not valid JSON', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        htmlString: 'hello-world',
        options: '{not json',
      },
      settings: {},
    })

    await htmlToPdf.onEvent({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onError).toHaveBeenCalled()
    expect(htmlToBase64PdfSpy).not.toHaveBeenCalled()
  })
})
