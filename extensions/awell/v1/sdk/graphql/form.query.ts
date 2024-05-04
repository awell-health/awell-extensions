export const GetFormQuery = `
query GetForm($id: String!) {
    form(id: $id) {
        code
        success
        form {
            id
            release_id
            definition_id
            title
            key
            metadata
            trademark
            questions {
                id
                definition_id
                title
                key
                dataPointValueType
                questionType
                userQuestionType
                metadata
                options {
                    id
                    value
                    value_string
                    label
                }
                rule {
                    boolean_operator
                    conditions {
                        id
                        reference
                        operator
                        operand {
                            type
                            value
                        }
                    }
                }
                questionConfig {
                    recode_enabled
                    mandatory
                    use_select
                    slider {
                        min
                        max
                        step_value
                        min_label
                        max_label
                        is_value_tooltip_on
                        display_marks
                        show_min_max_values
                    }
                    phone {
                        default_country
                        available_countries
                    }
                    number {
                        range {
                            min
                            max
                            enabled
                        }
                    }
                    multiple_select {
                        range {
                            enabled
                            min
                            max
                        }
                        exclusive_option {
                            enabled
                            option_id
                        }
                    }
                    date {
                        allowed_dates
                        include_date_of_response
                    }
                }
            }
        }
    }
}

`
