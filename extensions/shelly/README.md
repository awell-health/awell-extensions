---
title: Shelly
description: Smart tools to help with communication, information, and summaries in your care flow.
---

# Shelly

Shelly provides a set of smart tools that use artificial intelligence (most precisely Large Language Models) to help automate tasks and manage information within your care flow.

Actions labeled as Beta are still experimental and should not be used for production use cases. They are safe for demo and experimenting. Others are production ready - go ahead and use them.

## Actions

Below is a detailed look at each tool Shelly offers, what it needs to work, what it gives you back, and how to use it best.

### Categorize Message (Beta)

This tool automatically analyzes and categorizes incoming messages based on a set of predefined categories that you specify. It's particularly useful for triaging patient communications and routing them to the appropriate part of your care flow based on content and urgency.

**What it needs (Inputs):**
- `Message` (Required): The text of the message that needs categorization.
- `Categories` (Required): A list of predefined categories to classify against, separated by commas (e.g., "Medication Refill,Appointment Request,Symptom Report,Insurance Question,Urgent Medical Issue").

**What it gives back (Outputs):**
- `Category`: The determined ONE category from your predefined list. If no suitable match is found, it returns "None".
- `Explanation`: A concise explanation (in HTML format) of the reasoning behind the categorization, which can be displayed to care team or used for auditing.

**Tips for best results:**
- Use distinct categories that align with your clinical workflows.
- Categories should reflect common patient communication types in your practice.
- Avoid ambiguity as current Categorize Message selects only one suitable category.

**Example:**
```
Input:
  Message: "Hello, I need a refill for my blood pressure medication (Lisinopril 20mg). I've been taking it for the past year, and I'm down to my last few pills. My prescription number is RX43821. Can you please send a refill request to my usual pharmacy? I haven't had any side effects or issues with this medication."
  Categories: "Medication Refill Request,Appointment Scheduling,Non-urgent Symptom Report,Insurance/Billing Question,Urgent Medical Concern"

Output:
  Category: "Medication Refill Request"
  Explanation: "This message clearly states a need for medication refill, specifically for Lisinopril. The patient provides prescription details and mentions having no side effects or issues. The communication is straightforward and fits perfectly into the 'Medication Refill Request' category as the patient is explicitly asking for a prescription renewal rather than scheduling an appointment, reporting symptoms, asking about insurance, or expressing an urgent concern."
```

### Generate Message (Beta)

This tool creates contextually appropriate, personalized communications for patients or healthcare team members based on specific clinical situations and communication needs.

**What it needs (Inputs):**
- `Communication Objective` (Required): The clinical purpose and context of the message (e.g., "Welcome the patient to our chronic care management program", "Gather initial health information before the first appointment", "Remind the patient about their upcoming medication refill deadline," "Provide detailed preparation instructions for the upcoming colonoscopy procedure").
- `Personalization Input` (Optional): Clinical and demographic information to personalize the message (e.g., patient name, patient demographics, any other relevant information).
- `Stakeholder` (Optional): The intended recipient's role (e.g., "Patient", "Caregiver", "Primary Care Provider", "Specialist"). Defaults to "Patient".
- `Language` (Optional): The language for the message. Defaults to English.

**What it gives back (Outputs):**
- `Subject`: A clinically appropriate subject line for the message.
- `Message`: The complete message content (in HTML format).

**Tips for best results:**
- Include relevant context in the communication objective.
- Make sure to include all personalization details for better personalized outreach.

**Example:**
```
Input:
  Communication Objective: "Remind the patient about their upcoming appointment and provide preparation instructions (fasting 8 hours before, come 15 minutes early)."
  Personalization Input: "Patient Name: Emma Johnson, Appointment Date: July 15, 2023, Appointment Time: 2:30 PM, Provider: Dr. Sarah Chen, Appointment Type: Annual Physical Exam, Fasting Required: Yes (8 hours)"
  Stakeholder: "Patient"
  Language: "English"

Output:
  Subject: "Reminder: Your Appointment with Dr. Chen on July 15"
  Message: "<p>Dear Emma,</p><p>This is a friendly reminder about your upcoming appointment:</p><p><strong>Date:</strong> July 15, 2023<br><strong>Time:</strong> 2:30 PM<br><strong>Provider:</strong> Dr. Sarah Chen<br><strong>Type:</strong> Annual Physical Exam</p><p><strong>Important Preparation Instructions:</strong></p><ul><li>Please fast for 8 hours before your appointment (water is permitted)</li><li>Arrive 15 minutes early to complete any necessary paperwork</li><li>Bring your identification and insurance information</li></ul><p>We look forward to seeing you!</p><p>Best regards,<br>The Care Team</p>"
```

### Medication From Image (Beta)

This tool uses advanced image processing and AI to extract structured medication information from images of prescription labels, medication packaging, or pill bottles.

**What it needs (Inputs):**
- `Image URL` (Required): The URL of the medication image to be processed.

**What it gives back (Outputs):**
- `Data`: Structured medication information in JSON format, including elements like medication name, dosage, frequency, and instructions.
- `Medication As Text`: A formatted plain text version of the extracted medication information for easier human readability.

**Tips for best results:**
- Ensure adequate lighting and focus when capturing images.
- Position the camera to capture the entire medication label clearly.
- The tool can process various image types:
  - Prescription labels and bottles
  - Medication packaging and boxes
  - Handwritten or printed medication lists
  - Photos of medication tables or charts
  - Images containing multiple medications
- For medication lists, ensure the text is clearly visible and the image is not blurry.
- Multiple medications in a single image will be identified and separated when possible.

**Example:**
```
Input:
  Image URL: "https://example.com/rx_image.jpg"

Output:
  Data: '{"medications":[{"name":"Atorvastatin","dosage":"40 mg","frequency":"Once daily","instructions":"Take in the evening","prescriber":"Dr. Jennifer Wilson","pharmacy":"CityHealth Pharmacy","rxNumber":"RX80442553","dateIssued":"2023-05-15","refills":"2 remaining"}]}'
  Medication As Text: "Name: Atorvastatin\nDosage: 40 mg\nFrequency: Once daily\nInstructions: Take in the evening\nPrescriber: Dr. Jennifer Wilson\nPharmacy: CityHealth Pharmacy\nRx Number: RX80442553\nDate Issued: 2023-05-15\nRefills: 2 remaining"
```

### Review Medication Extraction

This tool enables qualified clinical staff to review, validate, and if necessary, correct medication information extracted from images.

**What it needs (Inputs):**
- `Image URL` (Required): The URL of the medication image that was processed.
- `Extracted Medication` (Required): The structured medication data generated by the Medication From Image action.

**What it gives back (Outputs):**
- `Reviewed Data`: The validated or corrected medication information in JSON format.
- `Review Status`: The verification status (e.g., "Verified Without Changes", "Corrected", "Rejected").

**Tips for best results:**
- Assign this task to staff members with clinical medication knowledge.
- The interface presents both the original image and extracted data side-by-side.
- Corrections made during review are captured for quality improvement.
- Consider implementing this as part of a medication reconciliation workflow.

### Summarize Care Flow (Beta)

This tool generates comprehensive, contextualized summaries of a patient's progress through their care flow, highlighting key activities, routes taken, and outcomes.

**What it needs (Inputs):**
- `Additional Instructions` (Optional): Specific focus areas for the summary (e.g., "Focus on form completions and reminder effectiveness," "Summarize patient engagement patterns").
- `Stakeholder` (Optional): The intended audience (e.g., "Care Coordinator", "Administrator", "Patient", "Provider"). This affects terminology and detail level.

**What it gives back (Outputs):**
- `Summary`: A comprehensive summary of the care flow progress (in HTML format). All summaries include an AI-generated disclaimer for transparency and regulatory compliance.

**Tips for best results:**
- Use additional instructions to focus on specific care flow parts.
- Specify the stakeholder to ensure appropriate terminology and detail level.

**Example:**
```
Input:
  Additional Instructions: "Focus on patient engagement with the intake forms, summarize the reminder sequence and when forms were completed."
  Stakeholder: "Care Coordinator"

Output:
  Summary: "<p><strong>Important Notice:</strong> This is an AI-generated summary for the 'New Patient Intake' care flow (ID: cf_12345).</p><p><strong>Summary: Patient Intake Process</strong></p><p>Patient Alex Morgan (38) was enrolled in the New Patient Intake process on June 3, 2023. The care flow included three required forms: Personal Information, Medical History, and Insurance Verification.</p><p><strong>Form Completion Timeline:</strong></p><ul><li><strong>Personal Information Form:</strong> Completed immediately during enrollment (June 3)</li><li><strong>Medical History Form:</strong> Not completed initially<ul><li>First reminder sent: June 5 via email</li><li>Second reminder sent: June 8 via text message</li><li>Form completed: June 9 (after 2 reminders)</li></ul></li><li><strong>Insurance Verification Form:</strong> Not completed initially<ul><li>First reminder sent: June 5 via email</li><li>Second reminder sent: June 8 via text message</li><li>Third reminder sent: June 12 via phone call</li><li>Form completed: June 12 (after 3 reminders during call)</li></ul></li></ul><p><strong>Engagement Analysis:</strong> Patient responded to text message reminders most effectively (completed Medical History form within 24 hours of text reminder). The Insurance Verification form required additional support, which was successfully provided during the phone call reminder.</p><p><strong>Next Steps:</strong> All required intake forms have been completed. Patient is now ready for their first appointment on June 15, 2023.</p>"
```

### Summarize Form

This tool analyzes patient-reported data from forms and generates concise, relevant summaries that highlight key findings in question-answer pairs. It focuses on the last form in the step before this AI Action is included in.

**What it needs (Inputs):**
- `Summary Format` (Required): Preferred format for the summary ("Bullet Points" or "Paragraph").
- `Language` (Optional): Desired language for the summary. If not set, it automatically detects the form's language.
- `Additional Instructions` (Optional): Any additional instructions like specific questions to focus on, desired level of detail, information to emphasize or exclude, etc.

**What it gives back (Outputs):**
- `Summary`: A formatted summary of form responses (in HTML format). All summaries include an AI-generated disclaimer for transparency and regulatory compliance.

**Tips for best results:**
- Use bullet point format for symptom reports and clinical findings.
- Use paragraph format for narrative elements like patient experiences.
- Additional instructions can help prioritize significant responses and level of details for your use case needs.
- Remember this is a summary, not a transcript - question-answer pairs from the form won't appear verbatim, and the AI will intelligently condense unnecessary details while preserving important information.

**Example:**
```
Input:
  Summary Format: "Bullet Points"
  Language: "English"
  Additional Instructions: "Highlight any pain scores >5, medication side effects, and changes since last assessment. Flag any responses requiring urgent clinical attention."

Output:
  Summary: "<p><strong>Important Notice:</strong> This is an AI-generated summary for form responses in version 2.3 of the 'Post-Surgical Follow-up' care flow (ID: cf_789).</p><p><strong>Post-Operative Assessment Summary:</strong></p><ul><li><strong>Pain Assessment</strong>: Reports pain level of 7/10 at surgical site <span style='color:red'>(CLINICAL ATTENTION ADVISED)</span></li><li>Pain characteristics: Described as 'sharp and throbbing,' worse with movement</li><li>Pain management: Taking prescribed oxycodone-acetaminophen as directed, but reporting inadequate relief</li><li><strong>Incision Site</strong>: Reports increasing redness and warmth around incision since yesterday <span style='color:red'>(CLINICAL ATTENTION ADVISED)</span></li><li>Drainage: Minimal serous drainage, no purulence reported</li><li><strong>Functional Status</strong>: Ambulating with assistance, able to perform basic ADLs with moderate difficulty</li><li><strong>Medication Side Effects</strong>: Reports nausea and constipation with pain medication</li><li><strong>Vital Signs</strong> (self-reported): Temperature 99.8°F (37.7°C), slightly elevated from last assessment (98.6°F)</li><li><strong>Change Since Last Assessment</strong>: Patient reports increased pain and incision site changes over past 24 hours</li></ul>"
```

### Summarize Forms in Step

This tool analyzes data from multiple forms completed in a single step and creates summaries for each form. It processes all forms in the current step where this AI Action is included and organizes them by form title.

**What it needs (Inputs):**
- `Summary Format` (Required): Preferred format for the summary ("Bullet Points" or "Paragraph").
- `Language` (Optional): Desired language for the summary. If not set, it automatically detects the predominant language.
- `Additional Instructions` (Optional): Any additional instructions like specific questions to focus on, desired level of detail, information to emphasize or exclude, etc.

**What it gives back (Outputs):**
- `Summary`: A formatted collection of all form responses in the step, organized by form title (in HTML format). All summaries include an AI-generated disclaimer for transparency and regulatory compliance.

**Tips for best results:**
- Particularly valuable for multi-form assessments that gather related information.
- Reduces the need to read through multiple form submissions separately.
- Remember this is a summary, not a transcript - question-answer pairs from the forms won't appear verbatim, and the AI will intelligently condense unnecessary details while preserving important information.

**Example:**
```
Input:
  Summary Format: "Bullet Points"
  Language: "Default"
  Additional Instructions: "Highlight key symptoms and lifestyle factors that might affect the patient's condition."

Output:
  Summary: "<p><strong>Important Notice:</strong> This is an AI-generated summary for form responses in the 'Diabetes Management' care flow (ID: cf_789).</p>

<p><strong>Blood Glucose Monitoring Form:</strong></p>
<ul>
<li>Morning readings averaging 145 mg/dL (target: <120 mg/dL)</li>
<li>Evening readings within normal range (average 115 mg/dL)</li>
<li>Two hypoglycemic events reported this week (both after exercise)</li>
<li>Consistent monitoring schedule (14/14 planned measurements completed)</li>
</ul>

<p><strong>Nutrition Assessment Form:</strong></p>
<ul>
<li>Carbohydrate intake: 45-60g per meal, within recommended range</li>
<li>Reported difficulty avoiding carbs at dinner social events</li>
<li>Successfully increased vegetable consumption to 3-4 servings daily</li>
<li>Water intake below recommendation (4 glasses vs. recommended 8)</li>
</ul>

<p><strong>Physical Activity Log:</strong></p>
<ul>
<li>Walking: 20 minutes daily (consistent pattern)</li>
<li>Strength training: 2 sessions this week (target: 3 sessions)</li>
<li>Reports joint pain in knees after longer walking sessions</li>
<li>Activity level increases on weekends, with lower glucose readings noted after weekend activities</li>
</ul>"
```

### Summarize Track Outcome

This tool analyzes the progression through a specific track in a care flow, highlighting key routes taken and outcomes.

**What it needs (Inputs):**
- `Instructions` (Optional): Specific focus for the analysis (e.g., "Summarize outcome, focus on semantic information in form and messages").

**What it gives back (Outputs):**
- `Outcome Summary`: A comprehensive summary of the track's progression and outcomes (in HTML format).

**Tips for best results:**
- Make sure you build a care flow in a way that AI action can leverage semantic information (meaningful names of steps, labels, meaningful names of actions)
- NOTE: AI action does not have access to transition logic; it only can see which routes were taken and which steps were discarded.

**Example:**
```
Input:
  Instructions: "Summarize outcome, focus on semantic information in form and messages"

Output:
  Outcome Summary: "<p><strong>Important Notice:</strong> This is an AI-generated summary for the 'Patient Symptom Assessment' care flow (ID: cf_567).</p><p><strong>Track Outcome Summary:</strong></p><p><strong>Outcome:</strong> The initial assessment form was completed, summarizing the patient's symptoms and concerns.</p><p><strong>Details Supporting the Outcome:</strong></p><ul><li>The initial assessment form was presented to the patient, Samantha Joe, who provided responses indicating symptoms of fever, fatigue, and shortness of breath, with a severity level of 8.</li><li>The patient confirmed having experienced these symptoms before and expressed a need for help with anxiety.</li><li>The form responses were summarized, highlighting the patient's primary concerns and symptom details.</li><li>The process concluded with the successful completion of the form summary.</li></ul>"
```


