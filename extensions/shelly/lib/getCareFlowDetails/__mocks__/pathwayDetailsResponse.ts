export const mockPathwayDetailsSuccess = {
  pathway: {
    code: '200',
    success: true,
    pathway: {
      id: 'test-pathway-id',
      title: 'Test Care Flow',
      pathway_definition_id: 'test-definition-id',
      release_id: 'test-release-id',
    },
  },
}

export const mockPathwayDetailsWithNonMatchingReleaseId = {
  pathway: {
    code: '200',
    success: true,
    pathway: {
      id: 'test-pathway-id',
      title: 'Test Care Flow',
      pathway_definition_id: 'test-definition-id',
      release_id: 'non-matching-release-id',
    },
  },
}

export const mockPathwayDetailsFailure = {
  pathway: {
    code: '404',
    success: false,
  },
} 