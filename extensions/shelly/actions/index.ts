import { summarizeForm } from './summarizeForm'
import { categorizeMessage } from './categorizeMessage'
import { summarizeCareFlow } from './summarizeCareFlow'
import { medicationFromImage } from './medicationFromImage'
import { reviewMedicationExtraction } from './reviewMedicationExtraction'
import { generateMessage } from './generateMessage'

const actions = {
  summarizeForm,
  summarizeCareFlow,
  categorizeMessage,
  generateMessage,
  medicationFromImage,
  reviewMedicationExtraction,
}

export default actions
