export const GetPathwayActivitiesQuery = `
query GetPathwayActivities($pathway_id: String!) {
    pathwayActivities(pathway_id: $pathway_id) {
        success
        activities {
            id
            status
            date
            isUserActivity
            subject {
                type
                name
            }
            action
            object {
                id
                type
                name
            }
            indirect_object {
                id
                type
                name
            }
            form {
                title
                metadata
                questions {
                    key
                    title
                    questionConfig {
                        mandatory
                    }
                }
            }
            track {
                id
                title
            }
            context {
                instance_id
                pathway_id
                track_id
                step_id
                action_id
            }
            session_id
            stakeholders {
                type
                id
                name
                email
                preferred_language
            }
            resolution
            stream_id
        }
    }
}
`
