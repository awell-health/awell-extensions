# OpenAI Models

This module provides standardized configuration and creation of OpenAI models through LangChain.

## Overview

The OpenAI Models module simplifies working with OpenAI's language models by providing:
- Standardized model configuration and initialization
- Consistent API key management
- Built-in error handling and retries
- Automatic metadata collection for tracing

## Available Models

Currently supported models:
- `gpt-4o` - Full GPT-4 model for complex tasks
- `gpt-4o-mini` - Smaller, faster GPT-4 variant for simpler tasks

## Implementation Details

### Basic Usage

### API Key Management

The module handles API key resolution in the following order:
1. Custom API key from extension settings (`settings.openAiApiKey`)
2. Default Awell API key (`helpers.getOpenAIConfig().apiKey`)
3. Throws error if no key is available

### Standard Configuration

All models are configured with these default settings:
- `temperature: 0` - For deterministic outputs
- `maxRetries: 3` - Automatic retry on failures
- `timeout: 10000` - 10 second timeout

See `constants.ts` for current values.

### Metadata Handling

The module automatically collects and includes tracing metadata:
- `care_flow_definition_id` - Definition ID of the care flow
- `care_flow_id` - ID of the current care flow
- `activity_id` - ID of the current activity
- #TODO: add tenant information

This metadata enables proper tracing and monitoring of LLM calls.
