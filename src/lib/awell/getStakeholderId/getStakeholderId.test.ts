import { getStakeholderId } from '.'
import { AwellSdk } from '@awell-health/awell-sdk'

jest.mock('@awell-health/awell-sdk', () => {
  return {
    AwellSdk: jest.fn().mockImplementation(() => ({
      orchestration: {
        query: jest.fn(),
      },
    })),
  }
})

describe('getStakeholderId', () => {
  let awellSdkMock: jest.Mocked<AwellSdk>

  beforeEach(() => {
    jest.clearAllMocks()

    awellSdkMock = new AwellSdk({
      apiKey: 'mock-api-key',
    }) as jest.Mocked<AwellSdk>
  })

  test('Returns the patient ID when the matched stakeholder has the PATIENT clinical app role', async () => {
    const mockQuery = awellSdkMock.orchestration.query as jest.Mock
    mockQuery.mockResolvedValue({
      stakeholdersByReleaseIds: {
        success: true,
        stakeholders: [
          {
            id: 'stakeholder-definition-id',
            label: { en: 'Patient' },
            definition_id: 'definition-id',
            clinical_app_role: 'PATIENT',
          },
        ],
      },
    })

    const result = await getStakeholderId({
      awellSdk: awellSdkMock,
      pathwayId: 'a-care-flow-id',
      releaseId: 'a-release-id',
      patientId: 'a-patient-id',
      stakeholder: 'patient',
    })

    expect(result).toBe('a-patient-id')
  })

  test('Returns the stakeholder definition id for a non-patient stakeholder', async () => {
    const mockQuery = awellSdkMock.orchestration.query as jest.Mock
    mockQuery.mockResolvedValue({
      stakeholdersByReleaseIds: {
        success: true,
        stakeholders: [
          {
            id: 'care-team-stakeholder-id',
            label: { en: 'Care team' },
            definition_id: 'definition-id',
            clinical_app_role: 'CARE_TEAM',
          },
        ],
      },
    })

    const result = await getStakeholderId({
      awellSdk: awellSdkMock,
      pathwayId: 'a-care-flow-id',
      releaseId: 'a-release-id',
      patientId: 'a-patient-id',
      stakeholder: 'Care team',
    })

    expect(result).toBe('care-team-stakeholder-id')
  })

  test('Matches the stakeholder name case-insensitively', async () => {
    const mockQuery = awellSdkMock.orchestration.query as jest.Mock
    mockQuery.mockResolvedValue({
      stakeholdersByReleaseIds: {
        success: true,
        stakeholders: [
          {
            id: 'care-team-stakeholder-id',
            label: { en: 'Care Team' },
            definition_id: 'definition-id',
            clinical_app_role: 'CARE_TEAM',
          },
        ],
      },
    })

    const result = await getStakeholderId({
      awellSdk: awellSdkMock,
      pathwayId: 'a-care-flow-id',
      releaseId: 'a-release-id',
      patientId: 'a-patient-id',
      stakeholder: 'care team',
    })

    expect(result).toBe('care-team-stakeholder-id')
  })

  test('Throws when no stakeholder matches the given name', async () => {
    const mockQuery = awellSdkMock.orchestration.query as jest.Mock
    mockQuery.mockResolvedValue({
      stakeholdersByReleaseIds: {
        success: true,
        stakeholders: [
          {
            id: 'care-team-stakeholder-id',
            label: { en: 'Care team' },
            definition_id: 'definition-id',
            clinical_app_role: 'CARE_TEAM',
          },
        ],
      },
    })

    await expect(
      getStakeholderId({
        awellSdk: awellSdkMock,
        pathwayId: 'a-care-flow-id',
        releaseId: 'a-release-id',
        patientId: 'a-patient-id',
        stakeholder: 'unknown-stakeholder',
      }),
    ).rejects.toThrow(
      'Could not find stakeholder ID for unknown-stakeholder in care flow a-care-flow-id',
    )
  })

  test('Throws when the matched stakeholder is the patient but no patient ID is available', async () => {
    const mockQuery = awellSdkMock.orchestration.query as jest.Mock
    mockQuery.mockResolvedValue({
      stakeholdersByReleaseIds: {
        success: true,
        stakeholders: [
          {
            id: 'stakeholder-definition-id',
            label: { en: 'Patient' },
            definition_id: 'definition-id',
            clinical_app_role: 'PATIENT',
          },
        ],
      },
    })

    await expect(
      getStakeholderId({
        awellSdk: awellSdkMock,
        pathwayId: 'a-care-flow-id',
        releaseId: 'a-release-id',
        stakeholder: 'patient',
      }),
    ).rejects.toThrow(
      'Could not retrieve the patient ID for care flow a-care-flow-id.',
    )
  })
})
