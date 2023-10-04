import { generateTestPayload } from '../../../../src/tests'
import { addRow } from './addRow'

describe('addRow', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()
  const payload = {
    settings: {
      apiKey: 'api-key',
    },
    fields: {
      spreadsheetId: 'id',
      range: 'Sheet1',
      values: `['value', 'value2']`,
    },
  }

  it('Should append row to sheet', async () => {
    await addRow.onActivityCreated(
      generateTestPayload(payload),
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalledTimes(1)
  })
})
