export const mapHealthieGenderToIsoSex = (
  healthieGender: string | undefined | null
): 0 | 1 | 2 => {
  const lowercaseGender = healthieGender?.toLowerCase()
  switch (lowercaseGender) {
    case 'f':
    case 'female':
      return 2
    case 'm':
    case 'male':
      return 1
    default:
      return 0
  }
}
