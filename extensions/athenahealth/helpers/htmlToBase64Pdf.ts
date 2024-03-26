import puppeteer from 'puppeteer'

export const htmlToBase64Pdf = async (html: string): Promise<string> => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.setContent(html, {
    waitUntil: 'networkidle0', // Waits for network connections to finish
  })

  const pdfBuffer = await page.pdf({ format: 'A4' })
  const base64Pdf = pdfBuffer.toString('base64')

  await browser.close()

  return base64Pdf
}
