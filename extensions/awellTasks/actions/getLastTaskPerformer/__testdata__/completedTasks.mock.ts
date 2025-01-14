export const tasksMock = {
  tasks: [
    {
      id: 'f383c727-dcf0-426b-8c35-d012269cf2c0',
      title: 'Order Status Check: Durable Medical Equipment (DME)',
      description: 'form',
      due_at: '2025-01-13T21:12:34.993Z',
      task_type: 'awell',
      task_data: {
        task: {
          extension: [
            {
              url: 'http://example.org/fhir/StructureDefinition/task-duration',
              datapoint: 'JbWq8zFTcIFK',
              valueDuration: {
                unit: 'day',
                value: 0,
                system: 'http://unitsofmeasure.org',
              },
            },
          ],
          requestedPeriod: {
            start: '2025-01-13T21:12:34.993Z',
          },
        },
        pathway: {
          id: 'mJHL1MwlPPcl',
          tenant_id: 'SpulxIRrQzqd',
          patient_id: 'brEwWYbownx4tTktqVSQs',
          start_date: '2025-01-13T21:03:54.176Z',
          pathway_definition_id: 'jmJHzMC8tWUv',
        },
        activity: {
          id: 'WkWOwe7cRaOi3KdRXJjJa',
          date: '2025-01-13T21:12:38.903Z',
          label: {
            id: 'BMezOFopU8sE',
            text: '',
            color: 'green',
          },
          track: {
            id: 'TWQEoUMseAt2',
            title: 'Order Status Check (Follow-up)',
          },
          action: 'assigned',
          object: {
            id: 'AVpZloD8aKus',
            name: 'Order Status Check: Durable Medical Equipment (DME)',
            type: 'form',
          },
          status: 'active',
          context: {
            step_id: 'TXgx4ifPnqoJ',
            track_id: 'L6XxJpHoe19d',
            action_id: 'IYzx1cXdegBU',
            pathway_id: 'mJHL1MwlPPcl',
            instance_id: 'IYzx1cXdegBU',
          },
          subject: {
            name: 'Awell',
            type: 'awell',
          },
          metadata: {
            task: {
              extension: [
                {
                  url: 'http://example.org/fhir/StructureDefinition/task-duration',
                  datapoint: 'JbWq8zFTcIFK',
                  valueDuration: {
                    unit: 'day',
                    value: 0,
                    system: 'http://unitsofmeasure.org',
                  },
                },
              ],
              requestedPeriod: {
                start: '2025-01-13T21:12:34.993Z',
              },
            },
          },
          stream_id: 'mJHL1MwlPPcl',
          session_id: 'rWQdP89ViGFp',
          reference_id: 'PathwayNavigationNode/1995669698',
          container_name: 'Order Status Check (P)',
          isUserActivity: true,
          reference_type: 'navigation',
          sub_activities: [
            {
              id: 'FkRVUuWHMnAUmsaSKe1lk',
              date: '2025-01-13T21:12:39.903Z',
              action: 'activate',
              subject: {
                name: 'Awell',
                type: 'awell',
              },
            },
            {
              id: 'op5wLTVs8ji95Wrkz9Lf1',
              date: '2025-01-13T21:12:39.021Z',
              action: 'reported',
              subject: {
                name: 'System',
                type: 'awell',
              },
            },
          ],
          indirect_object: {
            id: 'Lqkeow0jp1fq',
            name: 'PCM Team',
            type: 'stakeholder',
          },
        },
      },
      status: 'completed',
      priority: null,
      preferred_service_location: '141249867940087',
      completed_at: '2025-01-13T21:14:31.351Z',
      created_at: '2025-01-13T21:12:39.496Z',
      updated_at: '2025-01-13T21:14:31.351Z',
      patient_id: '845c4988-aa33-49ae-b330-d9019e6e2618',
      performer: {
        stytch_user_id: 'stytch-member-id',
        first_name: 'Nick',
        last_name: 'Hellemans',
        email: 'nick@awellhealth.com',
      },
      task_identifiers: [
        {
          system: 'https://awellhealth.com/activity',
          value: 'WkWOwe7cRaOi3KdRXJjJa',
        },
      ],
      patient: {
        first_name: 'Test24',
        last_name: 'Patient24',
        patient_identifiers: [
          {
            system: 'https://www.elationhealth.com/',
            value: '141851021279233',
          },
          {
            system: 'https://awellhealth.com/patient',
            value: 'brEwWYbownx4tTktqVSQs',
          },
        ],
      },
    },
  ],
  pagination: {
    total_count: 241,
    limit: 1,
    offset: 0,
  },
}
