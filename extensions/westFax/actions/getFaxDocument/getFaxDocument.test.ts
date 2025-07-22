import { TestHelpers } from '@awell-health/extensions-core'
import { WestFaxApiClient } from '../../lib/api/client'
import { getFaxDocument as action } from './getFaxDocument'
import { getFaxDocumentMock } from './__mocks__/GetFaxDocument.mock'

describe('WestFax - Get fax document', () => {
  let getFaxDocumentSpy: jest.SpyInstance

  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
  })

  describe('Happy path', () => {
    beforeEach(() => {
      getFaxDocumentSpy = jest
        .spyOn(WestFaxApiClient.prototype, 'getFaxDocument')
        .mockImplementationOnce(
          jest.fn().mockResolvedValue({ data: getFaxDocumentMock }),
        )
    })

    test('Should work', async () => {
      await extensionAction.onEvent({
        payload: {
          fields: {
            faxId: '1',
          },
          settings: {
            username: 'username',
            password: 'password',
            productId: 'productId',
          },
        } as any,
        onComplete,
        onError,
        helpers,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          base64EncodedFax:
            getFaxDocumentMock.Result[0].FaxFiles[0].FileContents,
          direction: getFaxDocumentMock.Result[0].Direction,
          date: getFaxDocumentMock.Result[0].Date,
          status: getFaxDocumentMock.Result[0].Status,
          format: getFaxDocumentMock.Result[0].Format,
          pageCount: String(getFaxDocumentMock.Result[0].PageCount),
        },
      })
    })
  })
})
