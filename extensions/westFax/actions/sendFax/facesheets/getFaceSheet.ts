import axios from 'axios'
import { isEmpty, isNil } from 'lodash'

const DEFAULT_FACESHEET =
  'https://res.cloudinary.com/da7x4rzl4/image/upload/v1707740015/Awell%20Extensions/WestFax/default_facesheet.pdf'

export const getFaceSheet = async (
  customFaceSheetUrl?: string
): Promise<Buffer> => {
  try {
    const pdfUrl =
      isNil(customFaceSheetUrl) || isEmpty(customFaceSheetUrl)
        ? DEFAULT_FACESHEET
        : customFaceSheetUrl

    const headResponse = await axios.head(pdfUrl)

    // Check if the Content-Type header indicates a PDF file
    if (headResponse.headers['content-type'] === 'application/pdf') {
      // If it's a PDF, make a GET request to download the file
      const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' })
      const faceSheetPdfBuffer = Buffer.from(response.data)

      return faceSheetPdfBuffer
    } else {
      throw new Error('Face sheet URL does not point to a valid PDF file.')
    }
  } catch (error) {
    console.error('Error reading the face sheet template:', error)
    throw error
  }
}
