export const mockPublishedDefinitionsSuccess = {
  publishedPathwayDefinitions: {
    code: '200',
    success: true,
    publishedPathwayDefinitions: [
      {
        id: 'test-definition-id',
        title: 'Test Care Flow',
        version: 6,
        release_id: 'test-release-id',
      },
      {
        id: 'test-definition-id',
        title: 'Test Care Flow',
        version: 5,
        release_id: 'older-release-id',
      },
    ],
  },
}

export const mockPublishedDefinitionsWithSingleDefinition = {
  publishedPathwayDefinitions: {
    code: '200',
    success: true,
    publishedPathwayDefinitions: [
      {
        id: 'test-definition-id',
        title: 'Test Care Flow',
        version: 6,
        release_id: 'test-release-id',
      },
    ],
  },
}

export const mockPublishedDefinitionsFailure = {
  publishedPathwayDefinitions: {
    code: '404',
    success: false,
  },
} 