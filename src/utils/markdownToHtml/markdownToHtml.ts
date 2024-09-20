import { marked } from 'marked'

export const markdownToHtml = async (str: string): Promise<string> => {
  const htmlOutput = await marked(str)

  return htmlOutput
}
