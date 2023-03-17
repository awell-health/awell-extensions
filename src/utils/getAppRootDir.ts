import fs from 'fs'
import path from 'path'

export const getAppRootDir = (): string => {
  let currentDir = __dirname
  while (!fs.existsSync(path.join(currentDir, 'package.json'))) {
    currentDir = path.join(currentDir, '..')
  }

  return currentDir
}
