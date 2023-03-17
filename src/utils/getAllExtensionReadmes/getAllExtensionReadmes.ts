import fs from 'fs'
import path from 'path'
import Showdown from 'showdown'
import { getAppRootDir } from '..'

const converter = new Showdown.Converter()
const basePath = path.join(getAppRootDir(), 'extensions')

const getHtmlFromMarkdownFile = (filePath: string): string => {
  try {
    const md = fs.readFileSync(filePath, 'utf-8')

    return converter.makeHtml(md)
  } catch {
    return ''
  }
}

export const getAllExtensionReadmes = (): Array<{
  extensionKey: string
  html: string
}> => {
  const extensionDirectories = fs
    .readdirSync(basePath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)

  const htmls = extensionDirectories.map((extensionDirectory) => {
    const filePath = path.join(basePath, extensionDirectory, 'README.md')
    const html = getHtmlFromMarkdownFile(filePath)

    return { extensionKey: extensionDirectory, html }
  })

  return htmls
}
