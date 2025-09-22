import { type AxiosResponse } from 'axios'

export const GetBinaryMockResponse = {
  status: 200,
  statusText: 'OK',
  data: "\"<div class=\\\"fmtConv\\\" style=\\\"line-height: normal; font-family: Arial; widows: 1; orphans: 1;\\\">\\r\\n\\r\\n<div style=\\\"text-align: left; max-width: 100%;\\\" data-paragraph=\\\"0\\\"><span style=\\\"font-size: 11pt; font-family: 'SEGOE UI', monospace; color: #000000;\\\" lang=\\\"en\\\">this is a test STU3 note.</span></div></div>\\r\\n\"",
} satisfies Partial<AxiosResponse>
