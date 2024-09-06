import { AppointmentsPayloadSchema } from './appointments'

describe('appointments', () => {
  it('Parses appointments payload without errors', () => {
    const payload = {
      event_id: 683401,
      application_id: 'iGhPjb2udF4oVDa2MMTNX6gcDk1SR5nl0Vdx1Fhw',
      resource: 'appointments',
      action: 'saved',
      data: {
        id: 142508453527642,
        scheduled_date: '2024-09-06T10:15:00Z',
        duration: 15,
        billing_details: null,
        payment: null,
        time_slot_type: 'appointment',
        time_slot_status: null,
        reason: 'Follow-Up',
        mode: 'IN_PERSON',
        description: '',
        status: {
          status: 'Scheduled',
          room: null,
          status_date: '2024-09-06T10:03:54Z',
          status_detail: null,
        },
        patient: 141986488057857,
        patient_forms: {
          patient_can_receive_forms: false,
          anonymous_url: null,
          overrides: [],
          short_code: null,
          statuses: [],
          hours_prior: null,
        },
        physician: 141377681883138,
        practice: 141127173275652,
        instructions: '',
        recurring_event_schedule: null,
        metadata: null,
        created_date: '2024-09-06T10:03:54Z',
        last_modified_date: '2024-09-06T10:03:54Z',
        deleted_date: null,
        service_location: {
          id: 141127173341431,
          name: 'Awell Test Account',
          is_primary: true,
          place_of_service: null,
          address_line1: '1234 Elation Dr',
          address_line2: 'Apt. 989',
          city: 'San Francisco',
          state: 'CA',
          zip: '94114',
          phone: '555555555555',
          created_date: '2022-11-10T23:21:13Z',
          deleted_date: null,
        },
        telehealth_details: null,
      },
    }

    expect(() => AppointmentsPayloadSchema.parse(payload)).not.toThrow()
  })
})
