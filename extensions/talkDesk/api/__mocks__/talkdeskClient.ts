/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { mockFlowTriggeredResponse } from './mockData'

export class TalkdeskAPIClient {
  triggerFlow = jest.fn(
    ({ flowId, data }: { flowId: string; data: Record<string, string> }) => {
      return mockFlowTriggeredResponse
    }
  )
}
