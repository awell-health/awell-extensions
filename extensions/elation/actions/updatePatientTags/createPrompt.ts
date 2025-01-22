export const createTagsUpdatePrompt = (existingTags: string[], prompt: string): string => {
    return `You are a clinical data manager. You will receive a list (array) of patient tags for a single patient and instructions about which tags to add, update, or remove. These tags are used to assign particular attributes to patients which can help with patient care, like grouping of patients, categorizing patients for reporting, or identifying patients for care.
        
      Important instructions:
      - The maximum number of tags is 10.
      - The max length of a single tag is 100 characters.
      - Ensure tags are unique.
  
      Input array: ${JSON.stringify(existingTags)}
      Instruction: ${prompt}`
  }