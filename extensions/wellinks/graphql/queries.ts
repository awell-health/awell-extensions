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