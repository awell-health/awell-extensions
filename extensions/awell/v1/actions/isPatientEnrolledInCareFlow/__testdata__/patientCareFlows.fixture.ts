import { PathwayStatus, type PatientPathway } from '../../../gql/graphql'

export const careFlowInstanceOne = {
  id: 'pathway-instance-id-1',
  title: 'Pathway definition one',
  pathway_definition_id: 'pathway-definition-1',
  release_id: 'release-1',
  status: PathwayStatus.Active,
}

export const careFlowInstanceTwo = {
  id: 'pathway-instance-id-2',
  title: 'Pathway definition one',
  pathway_definition_id: 'pathway-definition-1',
  release_id: 'release-1',
  status: PathwayStatus.Active,
}

export const careFlowInstanceThree = {
  id: 'pathway-instance-id-3',
  title: 'Pathway definition two',
  pathway_definition_id: 'pathway-definition-2',
  release_id: 'release-1',
  status: PathwayStatus.Active,
}

export const careFlowInstanceFour = {
  id: 'pathway-instance-id-4',
  title: 'Pathway definition three',
  pathway_definition_id: 'pathway-definition-3',
  release_id: 'release-1',
  status: PathwayStatus.Completed,
}

export const careFlowInstanceFive = {
  id: 'pathway-instance-id-5',
  title: 'Pathway definition one',
  pathway_definition_id: 'pathway-definition-1',
  release_id: 'release-1',
  status: PathwayStatus.Completed,
}

export const mockPatienCareFlowsResponse = [
  careFlowInstanceOne,
  careFlowInstanceTwo,
  careFlowInstanceThree,
  careFlowInstanceFour,
  careFlowInstanceFive,
]

export const getPathwayTestData = (
  data: PatientPathway
): {
  id: string
  definition_id: string
} => {
  return {
    id: data.id,
    definition_id: data.pathway_definition_id,
  }
}
