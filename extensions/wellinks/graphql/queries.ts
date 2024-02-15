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

export const SCHEDULED_APPOINTMENTS_QUERY = /* GraphQl */`
  query getScheduledAppointments($user_id: ID, $appointment_type_id: ID, $status: String) {
    appointments(user_id: $user_id, filter_by_appointment_type_id: $appointment_type_id, filter_by_appointment_status: $status, filter:"future") {
        id
        provider_name
        date
    }
  }`

export const CONVERSATION_MEMBERSHIPS_QUERY = /* GraphQL */`
  query getConversationMemberships ($client_id: String) {
    conversationMemberships(client_id: $client_id){
      convo {
        last_message_content
        updated_at
        dietitian_id
        patient_id
      }
    }
  }`


export const FORM_TEMPLATE_QUERY = /* GraphQL */ `
  query getFormTemplate($id: ID) {
    customModuleForm(id: $id) {
      id
      name
      use_for_charting
      use_for_program
      prefill
      has_matrix_field
      is_video
      has_non_readonly_modules
      custom_modules {
        id
        mod_type
        label
      }
    }
  }
`

export const GET_USER_QUERY = /* GraphQL */ `
  query getUser($id: ID) {
    user(id: $id) {
      id
      is_patient
    }
  }
`