---
title: Shelly
description: Library of AI-powered actions
---

# Shelly

Shelly is a library of AI-powered actions for enhancing workflow automation and data processing. It leverages advanced language models and specialized APIs to provide intelligent automation capabilities.

## Actions

### Categorize Message
Uses AI to classify messages into predefined categories.

- Analyzes message content using LLM
- Matches against provided categories
- Provides explanation for the categorization

Features:
- Supports custom category lists
- Handles multiple languages
- Returns "None" if no category matches
- Includes detailed explanation of the classification

### Generate Message
Creates personalized messages using AI.

- Takes communication objective and context
- Generates appropriate message content
- Formats according to stakeholder needs

Features:
- Customizable tone and style
- Multi-language support
- Personalization based on recipient data
- Context-aware message generation

### Medication From Image
Extracts structured medication information from images.

- Processes uploaded medication images
- Uses specialized API for text extraction
- Returns structured medication data

Features:
- Extracts medication names, dosages, and instructions
- Supports various image formats
- Returns both structured data and text summary
- Includes error handling for unclear images

### Review Medication Extraction
Allows stakeholders to review and validate extracted medication information.

- Displays extracted medication data
- Provides interface for validation
- Captures reviewer feedback

Features:
- Side-by-side image and data comparison
- Validation workflow
- Support for corrections and annotations

### Summarize Care Flow
Provides an AI-generated summary of the entire care flow progress.

- Collects all relevant care flow data
- Analyzes activities and outcomes
- Generates a comprehensive summary

Features:
- Customizable for different stakeholders (e.g., clinicians, patients)
- Optional focus areas through additional instructions
- Includes relevant context and disclaimers

### Summarize Form
Uses AI to generate concise summaries of form responses.

- Retrieves the latest form data from the current step
- Processes form responses with an LLM
- Generates a structured summary in the specified format

Features:
- Supports bullet-point or paragraph format
- Customizable language selection
- Optional additional instructions for focused summaries
- Includes context-aware disclaimers

### Summarize Forms in Step
Similar to summarizeForm but processes all forms within a step.

Features:
- Combines data from multiple forms
- Maintains context between form responses
- Same formatting options as single form summaries

### Summarize Track Outcome
Generates comprehensive summaries of track activities and outcomes.

- Analyzes track data and activities
- Identifies key outcomes and decisions
- Creates structured summary

Features:
- Customizable focus areas
- Support for specific outcome analysis
- Flexible formatting options
- Context-aware summaries