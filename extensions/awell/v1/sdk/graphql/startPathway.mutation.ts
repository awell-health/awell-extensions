export const startPathwayMutation = `
mutation StartPathway($input: StartPathwayInput!) {
  startPathway(input: $input) {
    pathway_id
  }
}
`
