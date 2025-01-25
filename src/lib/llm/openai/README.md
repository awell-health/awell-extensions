# OpenAI Models

This module provides standardized configuration and creation of OpenAI models through LangChain.

## Overview

The OpenAI Models module simplifies working with OpenAI's language models by providing:
- Standardized model configuration and initialization 
- Consistent API key management
- Built-in error handling and automatic retries
- Comprehensive metadata collection and tracing

## Available Models

Currently supported models:
- `gpt-4` - Latest GPT-4 model for complex reasoning and generation tasks
- `gpt-4-turbo` - Optimized GPT-4 variant balancing performance and speed

These models should be sufficient for most use cases. If additional models are needed, they can be easily added by expanding the model definitions in `constants.ts`. Note that when adding new models, always specify a model snapshot version (e.g. `gpt-4-0613`) rather than just the base model name to ensure consistent behavior over time.



## Usage Guide

### API Key Configuration

API keys are resolved in the following priority order:
1. Extension-specific key from settings (`settings.openAiApiKey`)
2. Default Awell API key (`helpers.getOpenAIConfig().apiKey`) 
3. Error thrown if no valid key found

### Default Settings

All models use these production-optimized defaults:
- `temperature: 0` - Consistent, deterministic outputs
- `maxRetries: 3` - Automatic retry on transient failures
- `timeout: 10000ms` - 10 second timeout for responses

Additional configuration options available in `constants.ts`.

### Metadata & Tracing

The module automatically captures context metadata including:
- Care flow information (definition ID, flow ID)
- Activity context (activity ID)
- Organization details (tenant ID, org ID/slug)

This enables:
- Request tracing and monitoring
- Usage analytics and optimization
- Cost allocation and tracking

### Privacy & Security 

LangSmith tracing is enabled by default but can be configured:
- Set `hideDataForTracing: true` to mask sensitive inputs/outputs
- Metadata and usage metrics still collected
- Helps balance monitoring needs with data privacy

### Error Handling

The module provides robust error handling:
- Automatic retries for transient failures
- Clear error messages for common issues
- Fallback behavior for degraded scenarios