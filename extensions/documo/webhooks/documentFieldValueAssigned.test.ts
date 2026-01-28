import { TestHelpers } from '@awell-health/extensions-core'
import { documentFieldValueAssigned as webhook } from './documentFieldValueAssigned'
import {
  fullPayload,
  phoneOnlyPayload,
  unmappedFieldsPayload,
  emptyAssignmentsPayload,
  withUserPayload,
} from './__testdata__/documentFieldValueAssigned.mock'

describe('Documo - Webhook - Document Field Value Assigned', () => {
  const { extensionWebhook, onSuccess, onError, helpers, clearMocks } =
    TestHelpers.fromWebhook(webhook)

  beforeEach(() => {
    clearMocks()
  })

  describe('When payload has all mapped fields', () => {
    it('should extract all patient fields correctly', async () => {
      await extensionWebhook.onEvent!({
        payload: {
          payload: fullPayload,
          settings: {},
          rawBody: Buffer.from(''),
          headers: {},
        },
        onSuccess,
        onError,
        helpers,
      })

      expect(onSuccess).toHaveBeenCalledWith({
        data_points: {
          webhookData: JSON.stringify(fullPayload),
          patientFirstName: 'John',
          patientLastName: 'Doe',
          patientZipCode: '80202-5544',
          patientIdentifiers: '["MRN123456","INS789012"]',
          patientMobilePhone: '555-123-4567',
          receivingProviderFullName: 'Dr. Smith, Primary Care',
        },
      })
      expect(onError).not.toHaveBeenCalled()
    })
  })

  describe('When payload has only phone number', () => {
    it('should extract phone number and set other fields to empty strings', async () => {
      await extensionWebhook.onEvent!({
        payload: {
          payload: phoneOnlyPayload,
          settings: {},
          rawBody: Buffer.from(''),
          headers: {},
        },
        onSuccess,
        onError,
        helpers,
      })

      expect(onSuccess).toHaveBeenCalledWith({
        data_points: {
          webhookData: JSON.stringify(phoneOnlyPayload),
          patientFirstName: '',
          patientLastName: '',
          patientZipCode: '',
          patientIdentifiers: '',
          patientMobilePhone: '720-862-4005',
          receivingProviderFullName: '',
        },
      })
      expect(onError).not.toHaveBeenCalled()
    })
  })

  describe('When payload has no mapped fields', () => {
    it('should set all patient fields to empty strings', async () => {
      await extensionWebhook.onEvent!({
        payload: {
          payload: unmappedFieldsPayload,
          settings: {},
          rawBody: Buffer.from(''),
          headers: {},
        },
        onSuccess,
        onError,
        helpers,
      })

      expect(onSuccess).toHaveBeenCalledWith({
        data_points: {
          webhookData: JSON.stringify(unmappedFieldsPayload),
          patientFirstName: '',
          patientLastName: '',
          patientZipCode: '',
          patientIdentifiers: '',
          patientMobilePhone: '',
          receivingProviderFullName: '',
        },
      })
      expect(onError).not.toHaveBeenCalled()
    })
  })

  describe('When payload has empty assignments', () => {
    it('should set all patient fields to empty strings', async () => {
      await extensionWebhook.onEvent!({
        payload: {
          payload: emptyAssignmentsPayload,
          settings: {},
          rawBody: Buffer.from(''),
          headers: {},
        },
        onSuccess,
        onError,
        helpers,
      })

      expect(onSuccess).toHaveBeenCalledWith({
        data_points: {
          webhookData: JSON.stringify(emptyAssignmentsPayload),
          patientFirstName: '',
          patientLastName: '',
          patientZipCode: '',
          patientIdentifiers: '',
          patientMobilePhone: '',
          receivingProviderFullName: '',
        },
      })
      expect(onError).not.toHaveBeenCalled()
    })
  })

  describe('When payload has user present', () => {
    it('should extract patient fields regardless of user presence', async () => {
      await extensionWebhook.onEvent!({
        payload: {
          payload: withUserPayload,
          settings: {},
          rawBody: Buffer.from(''),
          headers: {},
        },
        onSuccess,
        onError,
        helpers,
      })

      expect(onSuccess).toHaveBeenCalledWith({
        data_points: {
          webhookData: JSON.stringify(withUserPayload),
          patientFirstName: 'Jane',
          patientLastName: '',
          patientZipCode: '',
          patientIdentifiers: '',
          patientMobilePhone: '',
          receivingProviderFullName: '',
        },
      })
      expect(onError).not.toHaveBeenCalled()
    })
  })

  describe('webhookData data point', () => {
    it('should always include the full payload as JSON', async () => {
      await extensionWebhook.onEvent!({
        payload: {
          payload: fullPayload,
          settings: {},
          rawBody: Buffer.from(''),
          headers: {},
        },
        onSuccess,
        onError,
        helpers,
      })

      const callArgs = onSuccess.mock.calls[0][0]
      const webhookData = JSON.parse(callArgs.data_points.webhookData)

      expect(webhookData.accountId).toBe(fullPayload.accountId)
      expect(webhookData.workspaceId).toBe(fullPayload.workspaceId)
      expect(webhookData.documentId).toBe(fullPayload.documentId)
      expect(webhookData.document).toEqual(fullPayload.document)
      expect(webhookData.assignments).toHaveLength(6)
    })
  })
})
