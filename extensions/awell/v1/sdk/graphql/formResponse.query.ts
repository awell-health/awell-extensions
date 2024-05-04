export const GetFormResponseQuery = `
query GetFormResponse($pathway_id: String!, $activity_id: String!) {
    formResponse(pathway_id: $pathway_id, activity_id: $activity_id) {
      success
      response {
        answers {
          question_id
          value
          label
          value_type
          label
        }
      }
    }
  }  
`
