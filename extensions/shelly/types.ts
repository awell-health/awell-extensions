export type MedicationData = {
  product_rxcui: string
  product_name: string
  brand_name: string
  dose_form_name: string
  prescribable_name: string
  extracted_medication_name: string
  extracted_brand_name: string
  extracted_dosage: string
  extracted_ndcg: string
}

export type ExtractMedicationResponse = {
  medications: MedicationData[]
  status: string
  error_explanation?: string
}
