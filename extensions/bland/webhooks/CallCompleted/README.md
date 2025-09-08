# Call Completed Webhook

The **Call Completed** webhook can receive notifications from Bland AI when a call attempt has completed, regardless of whether it was successful or not.

## Overview

This webhook triggers when Bland AI completes a call attempt and provides detailed information about the call outcome.

## Key Data Points

The webhook extracts and provides the following information:

- **`callId`** - Unique identifier for the call
- **`completed`** - Boolean indicating if the call attempt finished
- **`status`** - Call outcome (see status values below)
- **`answeredBy`** - Who answered the call (`human`, `voicemail`, `unknown`, `no-answer`, or `null`)
- **`errorMessage`** - Error description if the call failed
- **`callObject`** - Complete call data as JSON for detailed analysis

## Status Values

| Status | Description |
|--------|-------------|
| `completed` | Call was successfully completed (human or voicemail) |
| `failed` | Call failed to connect or complete |
| `busy` | Called number was busy |
| `no-answer` | Call was not answered |
| `canceled` | Call was canceled before completion |
| `unknown` | Status could not be determined |

## Additional Resources

- [Bland AI Call Details API Documentation](https://docs.bland.ai/api-v1/get/calls-id)