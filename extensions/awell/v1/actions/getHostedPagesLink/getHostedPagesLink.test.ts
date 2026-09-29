import { generateTestPayload } from '../../../../../tests'
import { getHostedPagesLink } from './getHostedPagesLink'
import { TestHelpers } from '@awell-health/extensions-core'

jest.mock('@awell-health/awell-sdk')

describe('Get hosted pages link', () => {
  const { onComplete, onError, extensionAction, helpers, clearMocks } =
    TestHelpers.fromAction(getHostedPagesLink)

  beforeEach(() => {
    clearMocks()
  })

  const stakeholdersInReleaseResponse = {
    stakeholdersByReleaseIds: {
      success: true,
      stakeholders: [
        {
          id: 'patient-stakeholder-definition-id',
          label: { en: 'Patient' },
          definition_id: 'patient-definition-id',
          clinical_app_role: 'PATIENT',
        },
        {
          id: 'care-team-stakeholder-id',
          label: { en: 'Care team' },
          definition_id: 'care-team-definition-id',
          clinical_app_role: 'CARE_TEAM',
        },
      ],
    },
  }

  test('Defaults to the patient when no stakeholder is provided', async () => {
    // First call resolves the pathway, second resolves stakeholders, third resolves the link.
    const query = jest
      .fn()
      .mockResolvedValueOnce({
        pathway: {
          pathway: {
            release_id: 'a-release-id',
            patient_id: 'a-patient-id',
          },
        },
      })
      .mockResolvedValueOnce(stakeholdersInReleaseResponse)
      .mockResolvedValueOnce({
        hostedPagesLink: {
          success: true,
          hosted_pages_link: {
            id: 'a-link-id',
            url: 'https://hosted.awellhealth.com/a-link-id',
          },
        },
      })

    helpers.awellSdk = jest.fn().mockResolvedValue({ orchestration: { query } })

    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: { careFlowId: 'a-care-flow-id' },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(query).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        hostedPagesLink: expect.objectContaining({
          __args: {
            pathway_id: 'a-care-flow-id',
            stakeholder_id: 'a-patient-id',
          },
        }),
      }),
    )

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        linkUrl: 'https://hosted.awellhealth.com/a-link-id',
      },
      events: expect.arrayContaining([
        expect.objectContaining({
          text: {
            en: 'Fetched the Hosted Pages link for care flow instance id a-care-flow-id and stakeholder patient (a-patient-id). Link URL is https://hosted.awellhealth.com/a-link-id.',
          },
        }),
      ]),
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Fetches the link for an explicitly provided, non-patient stakeholder', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce({
        pathway: {
          pathway: {
            release_id: 'a-release-id',
            patient_id: 'a-patient-id',
          },
        },
      })
      .mockResolvedValueOnce(stakeholdersInReleaseResponse)
      .mockResolvedValueOnce({
        hostedPagesLink: {
          success: true,
          hosted_pages_link: {
            id: 'a-link-id',
            url: 'https://hosted.awellhealth.com/care-team-link-id',
          },
        },
      })

    helpers.awellSdk = jest.fn().mockResolvedValue({ orchestration: { query } })

    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: { careFlowId: 'a-care-flow-id', stakeholder: 'Care team' },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(query).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        hostedPagesLink: expect.objectContaining({
          __args: {
            pathway_id: 'a-care-flow-id',
            stakeholder_id: 'care-team-stakeholder-id',
          },
        }),
      }),
    )

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        linkUrl: 'https://hosted.awellhealth.com/care-team-link-id',
      },
      events: expect.any(Array),
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Errors when there is no activity for the stakeholder, so no link is returned', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce({
        pathway: {
          pathway: {
            release_id: 'a-release-id',
            patient_id: 'a-patient-id',
          },
        },
      })
      .mockResolvedValueOnce(stakeholdersInReleaseResponse)
      .mockResolvedValueOnce({
        hostedPagesLink: {
          success: true,
          hosted_pages_link: null,
        },
      })

    helpers.awellSdk = jest.fn().mockResolvedValue({ orchestration: { query } })

    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: { careFlowId: 'a-care-flow-id' },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith({
      events: [
        expect.objectContaining({
          text: {
            en: 'Could not find a Hosted Pages link for stakeholder patient in care flow a-care-flow-id. There may be no activity for this stakeholder in this care flow.',
          },
        }),
      ],
    })
  })
})
