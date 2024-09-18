import { summarizeForm } from './summarizeForm'
import { categorizeMessage } from './categorizeMessage'
import { summarizeCareFlow } from './summarizeCareFlow'
import { medicationFromImage } from './medicationFromImage'
import { reviewMedicationExtraction } from './reviewMedicationExtraction'

const actions = {
  summarizeForm,
  summarizeCareFlow,
  categorizeMessage,
  medicationFromImage,
  reviewMedicationExtraction,
}

export default actions
