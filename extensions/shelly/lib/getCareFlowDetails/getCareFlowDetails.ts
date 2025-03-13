import { type AwellSdk } from '@awell-health/awell-sdk'

export interface CareFlowDetails {
  title: string
  id: string
  version: number | null
}

/**
 * Gets the care flow details including the correct version at pathway start time,
 * by using the release_id to match the specific version of the care flow definition.
 * 
 * @param awellSdk - The initialized Awell SDK
 * @param pathwayId - The ID of the pathway instance
 * @returns Promise resolving to care flow details {title, id, version}
 */
export async function getCareFlowDetails(
  awellSdk: AwellSdk,
  pathwayId: string
): Promise<CareFlowDetails> {
  try {
    // Step 1: Get the pathway details including release_id
    const pathwayDetails = await awellSdk.orchestration.query({
      pathway: {
        __args: {
          id: pathwayId,
        },
        code: true,
        success: true,
        pathway: {
          id: true,
          title: true,
          pathway_definition_id: true,
          release_id: true,
        },
      },
    });

    // Check if pathway details are available
    if (pathwayDetails.pathway === null || 
        pathwayDetails.pathway === undefined || 
        !pathwayDetails.pathway.success || 
        pathwayDetails.pathway.pathway === null || 
        pathwayDetails.pathway.pathway === undefined) {
      throw new Error(`Failed to fetch pathway details for pathway ID: ${pathwayId}`);
    }

    const pathwayDefinitionId = pathwayDetails.pathway.pathway.pathway_definition_id;
    const releaseId = pathwayDetails.pathway.pathway.release_id;
    const title = pathwayDetails.pathway.pathway.title !== undefined && 
                 pathwayDetails.pathway.pathway.title !== '' 
                 ? pathwayDetails.pathway.pathway.title 
                 : 'Unknown';

    if (pathwayDefinitionId === undefined || pathwayDefinitionId === '') {
      throw new Error('Missing pathway definition ID');
    }

    // Step 2: Get published pathway definitions to find the matching version
    const publishedDefinitions = await awellSdk.orchestration.query({
      publishedPathwayDefinitions: {
        code: true,
        success: true,
        publishedPathwayDefinitions: {
          id: true,
          title: true,
          version: true,
          release_id: true,
        },
      },
    });

    // If publishedDefinitions or its properties are undefined, return with null version
    if (!publishedDefinitions?.publishedPathwayDefinitions?.success || 
        !Array.isArray(publishedDefinitions?.publishedPathwayDefinitions?.publishedPathwayDefinitions)) {
      // Return basic details without version information
      return {
        title,
        id: pathwayDefinitionId,
        version: null
      };
    }

    // Step 3: Find the matching definition with the correct release_id
    const matchingDefinitions = publishedDefinitions.publishedPathwayDefinitions.publishedPathwayDefinitions.filter(
      (def) => def.id === pathwayDefinitionId
    );

    // Find the exact version that matches the release_id
    let version: number | null = null;
    
    if (releaseId !== undefined && releaseId !== '') {
      const matchingReleaseVersion = matchingDefinitions.find(
        (def) => def.release_id === releaseId
      );
      
      if (matchingReleaseVersion !== null && matchingReleaseVersion !== undefined) {
        version = matchingReleaseVersion.version;
      }
    }

    return {
      title,
      id: pathwayDefinitionId,
      version
    };
  } catch (error) {
    // Only log errors in non-test environments
    if (process.env.NODE_ENV !== 'test') {
      console.error('Error fetching care flow details:', error);
    }
    throw error;
  }
} 