export interface MedplumWebhookPayload {
    resourceType: string;
    id: string;
    name?: Array<{
      use?: string;
      given?: string[];
      family?: string;
    }>;
    meta?: {
      versionId: string;
      lastUpdated: string;
      author?: {
        reference: string;
        display?: string;
      };
      project?: string;
      compartment?: Array<{
        reference: string;
      }>;
    };
  }

  export const MEDPLUM_IDENTIFIER = 'https://www.medplum.com/docs/api/fhir/resources/patient'