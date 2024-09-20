import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'

export const markdownToHtml = async (str: string): Promise<string> => {
  try {
    const htmlOutput = await marked(str)
    const sanitizedHtmlOutput = sanitizeHtml(htmlOutput)

    return sanitizedHtmlOutput.trim()
  } catch {
    throw new Error('Unable to parse markdown string to HTML')
  }
}
