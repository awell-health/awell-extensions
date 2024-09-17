import 'dotenv/config'; // Make sure environment variables are loaded
import { categorizeMessageWithLLM } from './performCategorization';



describe('categorizeMessageWithLLM - Real OpenAI Call', () => {
    it('should categorize a message about scheduling an appointment using real LLM', async () => {
      const categories = ['Appointment Scheduling', 'Medical Symptoms Inquiry', 'Medication Questions', 'Administrative Assistance'];
      const message = 'I would like to schedule an appointment for next week.';
  
      const result = await categorizeMessageWithLLM(message, categories);
  
      expect(result).toBe('Appointment Scheduling'); // Expected category
    });
  
    it('should categorize a message about medication using real LLM', async () => {
      const categories = ['Appointment Scheduling', 'Medical Symptoms Inquiry', 'Medication Questions', 'Administrative Assistance'];
      const message = 'Can you tell me the correct dosage for my medication?';
  
      const result = await categorizeMessageWithLLM(message, categories);
  
      expect(result).toBe('Medication Questions'); // Expected category
    });
  
    it('should return "None" when the message does not match any category using real LLM', async () => {
      const categories = ['Appointment Scheduling', 'Medical Symptoms Inquiry', 'Medication Questions', 'Administrative Assistance'];
      const message = 'Is it going to rain tomorrow?'; // Non-related medical category
  
      const result = await categorizeMessageWithLLM(message, categories);
  
      expect(result).toBe('None'); // No match expected
    });
  });
