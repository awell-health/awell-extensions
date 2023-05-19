export const CHARTING_ITEMS_QUERY = /* GraphQl */`
query getChartingItems($user_id: String, $custom_module_form_id: ID){
    chartingItems(user_id: $user_id, custom_module_form_id: $custom_module_form_id){
      id
      created_at
      form_answer_group {
        id
        created_at
        form_answers {
        custom_module_id
        label
        answer
        }
      }
    }
  }`