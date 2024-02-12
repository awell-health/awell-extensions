import fs from 'fs'
import { promisify } from 'util'

const readFileAsync = promisify(fs.readFile)

export const getFaceSheet = async (): Promise<Buffer> => {
  try {
    const faceSheetPdfBuffer = await readFileAsync(
      './extensions/westFax/actions/sendFax/facesheets/templates/default_facesheet.pdf'
    )

    return faceSheetPdfBuffer
  } catch (error) {
    console.error('Error reading the face sheet template:', error)
    throw error
  }
}
