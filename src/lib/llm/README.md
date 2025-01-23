# LLM Library

This library provides standardized ways to create and configure LLM provider calls across our extensions.

## Structure

- `/openai` - OpenAI-specific implementations and configurations
- (future) `/anthropic` - Anthropic Claude implementations
- (future) `/gemini` - Google Gemini implementations

## Usage

Each provider has its own setup function that handles:
- API key management (custom keys vs default keys)
- Standard configuration (temperature, timeouts, etc.)
- Metadata for tracing
- Error handling

See provider-specific README files for detailed usage. 