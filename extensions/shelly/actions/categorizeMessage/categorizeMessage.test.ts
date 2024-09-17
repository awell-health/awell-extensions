import { TestHelpers } from '@awell-health/extensions-core';
import { generateTestPayload } from '@/tests';
import { categorizeMessage } from '.';
import { categorizeMessageWithLLM } from './performCategorization';


// // Mock categorizeMessageWithLLM initially
// jest.mock('./performCategorization', () => ({
//   categorizeMessageWithLLM: jest.fn(),
// }));

// describe('categorizeMessage - Mocked LLM calls', () => {
//   const { onComplete, onError, helpers, extensionAction, clearMocks } =
//     TestHelpers.fromAction(categorizeMessage);

//   beforeEach(() => {
//     clearMocks(); // Reset mocks before each test
//     jest.clearAllMocks(); // Reset any mock functions
//   });

//   it('should successfully categorize a message about scheduling an appointment (mocked)', async () => {
//     // Mock LangChain categorization logic to return "Appointment Scheduling"
//     (categorizeMessageWithLLM as jest.Mock).mockResolvedValue('Appointment Scheduling');

//     const payload = generateTestPayload({
//       fields: {
//         message: 'I would like to schedule an appointment for next week.',
//         categories: 'Appointment Scheduling,Medication Questions,Administrative Assistance,Feedback or Complaints',
//       },
//       pathway: {
//         id: 'mockPathwayId',
//         definition_id: 'mockDefinitionId',
//       },
//       activity: { id: 'mockActivityId' },
//       patient: { id: 'mockPatientId' },
//       settings: {}, // Empty settings if not needed
//     });

//     await extensionAction.onEvent({
//       payload,
//       onComplete,
//       onError,
//       helpers,
//     });

//     // Check that the LangChain function was called with the correct parameters
//     expect(categorizeMessageWithLLM).toHaveBeenCalledWith(
//       'I would like to schedule an appointment for next week.',
//       ['Appointment Scheduling', 'Medication Questions', 'Administrative Assistance', 'Feedback or Complaints']
//     );

//     expect(onComplete).toHaveBeenCalledWith({
//       data_points: {
//         category: 'Appointment Scheduling', // Expected category
//       },
//     });

//     expect(onError).not.toHaveBeenCalled();
//   });
// });

// Test case using real LLM calls
describe('categorizeMessage - Real LLM calls', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(categorizeMessage);

  beforeEach(() => {
    clearMocks(); // Reset mocks before each test
    jest.clearAllMocks(); // Reset any mock functions

    
    jest.unmock('./performCategorization');
  });

  it('should successfully categorize a message about scheduling an appointment using real LLM', async () => {
    const payload = generateTestPayload({
      fields: {
        message: 'I would like to schedule an appointment for next week.',
        categories: 'Appointment Scheduling,Medication Questions,Administrative Assistance,Feedback or Complaints',
      },
      pathway: {
        id: 'mockPathwayId',
        definition_id: 'mockDefinitionId',
      },
      activity: { id: 'mockActivityId' },
      patient: { id: 'mockPatientId' },
      settings: {}, // Empty settings if not needed
    });

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
    });

    // Real LangChain function is called
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        category: 'Appointment Scheduling', // Expected category from real LLM
      },
    });

    expect(onError).not.toHaveBeenCalled();
  });

  it('should return "None" when the message does not match any category using real LLM', async () => {
    const payload = generateTestPayload({
      fields: {
        message: 'What books do you like ro read?',
        categories: 'Appointment Scheduling,Medication Questions,Administrative Assistance,Feedback or Complaints',
      },
      pathway: {
        id: 'mockPathwayId',
        definition_id: 'mockDefinitionId',
      },
      activity: { id: 'mockActivityId' },
      patient: { id: 'mockPatientId' },
      settings: {}, // Empty settings if not needed
    });

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
    });

    // Real LangChain function is called and returns "None"
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        category: 'None', // Expected no match
      },
    });

    expect(onError).not.toHaveBeenCalled();
  });
});
