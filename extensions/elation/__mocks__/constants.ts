import { type CreateUpdatePatient } from "../types/patient";

export const patientExample: CreateUpdatePatient = {
    first_name: "Test",
    middle_name: "P",
    last_name: "Action",
    actual_name: "local test action",
    gender_identity: "man",
    legal_gender_marker: "M",
    pronouns: "he_him_his",
    sex: "Male",
    sexual_orientation: "unknown",
    primary_physician: 141127177601026,
    caregiver_practice: 141127173275652,
    dob: "1940-08-29",
    ssn: "123456789",
    race: "Asian",
    preferred_language: "English",
    ethnicity: "Not Hispanic or Latino",
    notes: "This is test Notes",
    previous_first_name: "",
    previous_last_name: "",
}