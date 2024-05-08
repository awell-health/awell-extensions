export const GetCalculationResultsQuery = `
query GetCalculationResults($pathway_id: String!, $activity_id: String!) {
    calculationResults(pathway_id: $pathway_id, activity_id: $activity_id) {
      success
      result {
        status
        subresult_id
        unit
        value
        value_type
      }
    }
  }
`
