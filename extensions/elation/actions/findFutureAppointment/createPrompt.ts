export const createAppointmentPrompt = (promptAppointments: string, prompt: string): string => {
    return `You are a helpful medical assistant. You will receive a list (array) of future appointments for a single patient and instructions about which appointment to find. You're supposed to use the information in the list to find an appointment that matches, if one exists. If no appointment exists that obviously matches the instructions, that's a perfectly acceptable outcome. If multiple appointments exist that match the instructions, you should return the first one. In any case, there can only be one appointment returned.
      
      Important instructions:
      - The appointment "reason" is the appointment type.
      - Pay close attention to the instructions. They are intended to have been written by a clinician, for a clinician.
      - Think like a clinician. In other words, "Rx" should match a prescription appointment or follow-up related to a prescription.

----------
Input array: 
${promptAppointments}
----------
Instruction: 
${prompt}
----------

Output a JSON object with two keys:
1. appointmentId: The id of the appointment that matches the instructions, if one exists. If no appointment exists that obviously matches, you should return null.
2. explanation: A readable explanation of how the appointment was found and why. Or, if no appointment exists that matches the instructions, an explanation of why.`
  }