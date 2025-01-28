import {
  startCareFlow,
  updatePatient,
  searchPatientsByPatientCode,
  stopCareFlow,
  isPatientEnrolledInCareFlow,
  updateBaselineInfo,
  addIdentifierToPatient,
  getPatientByIdentifier,
  startHostedPagesSession,
  startCareFlowAndSession,
  getDataPointValue,
} from './v1/actions'
import { type Extension } from '@awell-health/extensions-core'
import { settings } from './settings'
import { webhooks } from './v1/webhooks'
import { AuthorType, Category } from '@awell-health/extensions-core'

export const Awell: Extension = {
  key: 'awell',
  title: 'Awell Workflow',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1678870116/Awell%20Extensions/Awell_Logo.png',
  description: 'Enrich your care flows with powerful Awell actions.',
  category: Category.WORKFLOW,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions: {
    addIdentifierToPatient,
    getPatientByIdentifier,
    startCareFlow,
    updatePatient,
    stopCareFlow,
    searchPatientsByPatientCode,
    isPatientEnrolledInCareFlow,
    updateBaselineInfo,
    startHostedPagesSession,
    startCareFlowAndSession,
    getDataPointValue,
    // deletePatient, Deleting the patient who is currently enrolled in the pathway seems dangerous
  },
  webhooks,
}
