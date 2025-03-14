/**
 * Mock track data for testing the summarizeTrackOutcome action
 * This represents the cleaned track data structure returned by getTrackData
 */
export const mockTrackData = {
  track: {
    title: 'Medication Refill Request'
  },
  steps: [
    {
      name: 'Patient Request',
      label: 'Active',
      status: 'ACTIVE',
      start_date: '2023-05-15T10:30:00.000Z',
      stakeholders: [
        {
          name: 'Dr. Smith'
        }
      ],
      activities: [
        {
          date: '2023-05-15T10:30:00.000Z',
          action: 'SUBMITTED',
          status: 'DONE',
          subject: {
            type: 'PATIENT',
            name: 'John Doe'
          },
          object: {
            type: 'FORM',
            name: 'Medication Refill Request'
          },
          form: {
            title: 'Medication Refill Request',
            questions: [
              {
                title: 'Medication Name',
                response: 'Lisinopril 10mg'
              },
              {
                title: 'Last Refill Date',
                response: '2023-04-15'
              },
              {
                title: 'Pharmacy',
                response: 'CVS Pharmacy on Main St'
              },
              {
                title: 'Additional Notes',
                response: 'I need my blood pressure medication refilled as soon as possible.'
              }
            ]
          }
        },
        {
          date: '2023-05-15T11:45:00.000Z',
          action: 'DELEGATED',
          status: 'DONE',
          subject: {
            type: 'AWELL',
            name: 'Awell'
          },
          object: {
            type: 'PLUGIN_ACTION',
            name: 'Categorize Message'
          },
          indirect_object: {
            type: 'PLUGIN',
            name: 'Shelly (Beta)'
          },
          data_points: [
            {
              value: 'The message indicates a need for medication refill, which falls under medication management.',
              date: '2023-05-15T11:46:00.000Z',
              title: 'Analysis'
            },
            {
              value: 'Medication Refill Request',
              date: '2023-05-15T11:46:00.000Z',
              title: 'Category'
            }
          ]
        }
      ]
    },
    {
      name: 'Provider Response',
      label: 'Completed',
      status: 'COMPLETED',
      start_date: '2023-05-15T14:00:00.000Z',
      end_date: '2023-05-15T15:00:00.000Z',
      stakeholders: [
        {
          name: 'Dr. Smith'
        }
      ],
      activities: [
        {
          date: '2023-05-15T14:45:00.000Z',
          action: 'RESPONDED',
          status: 'DONE',
          subject: {
            type: 'PROVIDER',
            name: 'Dr. Smith'
          },
          object: {
            type: 'PATIENT',
            name: 'John Doe'
          },
          form: {
            title: 'Provider Response',
            questions: [
              {
                title: 'Action Taken',
                response: 'Prescription refilled for 90 days and sent to patient\'s pharmacy.'
              },
              {
                title: 'Follow-up Required',
                response: 'Yes, patient should schedule a blood pressure check in 30 days.'
              }
            ]
          }
        },
        {
          date: '2023-05-15T14:50:00.000Z',
          action: 'COMPLETED',
          status: 'DONE',
          subject: {
            type: 'AWELL',
            name: 'Awell'
          },
          object: {
            type: 'STEP',
            name: 'Provider Response'
          },
          data_points: [
            {
              value: '2023-05-15T15:00:00.000Z',
              date: '2023-05-15T14:50:00.000Z',
              title: 'Completion Date'
            }
          ]
        },
        {
          date: '2023-05-15T14:30:00.000Z',
          action: 'SENT',
          status: 'DONE',
          subject: {
            type: 'PROVIDER',
            name: 'Dr. Smith'
          },
          object: {
            type: 'MESSAGE',
            name: 'Medication Refill Confirmation'
          },
          message: {
            subject: 'Medication Refill Confirmation',
            body: '<p>Dear John Doe,</p><p>I have reviewed your request and approved the refill for Lisinopril 10mg. The prescription has been sent to CVS Pharmacy and should be ready for pickup within 24 hours.</p><p>Please schedule a follow-up appointment for a blood pressure check in the next 30 days.</p><p>Best regards,<br>Dr. Smith</p>'
          }
        }
      ]
    }
  ]
} 