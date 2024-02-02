export const FORM_ANSWER_GROUP_MUTATION = /* GraphQL */ `
  mutation createFormAnswerGroup($input: createFormAnswerGroupInput!) {
    createFormAnswerGroup(input: $input) {
      form_answer_group {
        id
      }
      messages {
        field
        message
      }
    }
  }
`
