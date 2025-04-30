/**
 * Converts HTML to a base64 encoded PDF
 * @param html - The HTML string to convert
 * @param options - The options for the PDF. See https://pptr.dev/api/puppeteer.pdfoptions
 * @returns The base64 encoded PDF
 */
export const htmlToBase64Pdf = async (
  html: string,
  options: any = {
    format: 'Letter',
    margin: {
      top: '10px',
      right: '10px',
      bottom: '10px',
      left: '10px',
    },
  },
): Promise<string> => {
  const base64Html = Buffer.from(html).toString('base64')
  const controller = new AbortController()
  const timeoutinMS = async (ms: number): Promise<never> => {
    // eslint-disable-next-line promise/param-names
    return await new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timed out after ${ms / 1000} seconds`))
      }, ms)
    })
  }
  const request = fetch('https://pdfserver-pqfwkqh3iq-uc.a.run.app', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: controller.signal,
    body: JSON.stringify({
      html: base64Html,
      ...(options && { options }),
    }),
  })
  const response = await Promise.race([request, timeoutinMS(30000)]).catch(
    (err) => {
      controller.abort()
      console.error(err)
      throw err
    },
  )
  const { pdf: base64Pdf } = await response.json()
  return base64Pdf
}
