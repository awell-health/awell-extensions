import { categorizeMessage } from './categorizeMessage'
import { generateMessage } from './generateMessage'
import { medicationFromImage } from './medicationFromImage'
import { parseStructuredData } from './parseStructuredData'
import { reviewMedicationExtraction } from './reviewMedicationExtraction'
import { summarizeCareFlow } from './summarizeCareFlow'
import { summarizeForm } from './summarizeForm'
import { summarizeFormsInStep } from './summarizeFormsInStep'
import { summarizeTrackOutcome } from './summarizeTrackOutcome'

const actions = {
  categorizeMessage,
  generateMessage,
  medicationFromImage,
  parseStructuredData,
  reviewMedicationExtraction,
  summarizeCareFlow,
  summarizeForm,
  summarizeFormsInStep,
  summarizeTrackOutcome,
}

export default actions
