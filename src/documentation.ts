import fs from 'fs'
import { has } from 'lodash'
import path from 'path'
import Showdown from 'showdown'

const converter = new Showdown.Converter({
  tables: true,
  emoji: true,
  underline: true,
})
const loadedDocumentations: Record<string, string> = {}
const loadedChangelogs: Record<string, string> = {}

const getAppRootDir = (): string => {
  let currentDir = __dirname
  while (!fs.existsSync(path.join(currentDir, 'package.json'))) {
    currentDir = path.join(currentDir, '..')
  }

  return currentDir
}

const getHtmlFromMarkdownFile = (filePath: string): string => {
  try {
    const md = fs.readFileSync(filePath, 'utf-8')
    return converter.makeHtml(md)
  } catch {
    return ''
  }
}

export const getExtensionDocumentation = (extensionKey: string): string => {
  if (has(loadedDocumentations, extensionKey)) {
    return loadedDocumentations[extensionKey]
  }
  const extensionReadme = path.join(
    getAppRootDir(),
    'extensions',
    extensionKey,
    'README.md'
  )
  const documentation = getHtmlFromMarkdownFile(extensionReadme)
  loadedDocumentations[extensionKey] = documentation
  return documentation
}

export const getExtensionChangelog = (extensionKey: string): string => {
  if (has(loadedChangelogs, extensionKey)) {
    return loadedChangelogs[extensionKey]
  }

  const extensionChangelogPath = path.join(
    getAppRootDir(),
    'extensions',
    extensionKey,
    'CHANGELOG.md'
  )

  const changelog = getHtmlFromMarkdownFile(extensionChangelogPath)
  loadedChangelogs[extensionKey] = changelog

  return changelog
}
