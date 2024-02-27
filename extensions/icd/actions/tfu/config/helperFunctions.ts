export const checkICDCode = (code: string): boolean => {
  const diseases = [
    'hypertension',
    'asthma',
    'diabetes mellitus',
    'heart failure',
    'copd',
    'cad',
    'coronary artery disease',
  ]
  if (diseases.includes(code.toLowerCase())) {
    return true
  } else {
    return false
  }
}
