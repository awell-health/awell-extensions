# Apigee

Integration with Google Cloud Apigee API Management platform to list and manage API proxies.

## Extension settings

The following settings are required for this extension to work:

- **GCP Project ID**: The Google Cloud Project ID where Apigee is enabled
- **Apigee Organization ID**: The Apigee organization ID to list API proxies from  
- **Credentials Strategy**: Authentication strategy (ADC by default)

## Actions

### List Apigee API Proxies

Lists all API proxies in the specified Apigee organization.

**Key**: `listApis`

#### Input fields

This action has no input fields.

#### Outputs

| Data point | Value type | Description |
| --- | --- | --- |
| proxies | strings_array | Array of API proxy names |
| proxyCount | number | Total number of API proxies |
| organizationId | string | The Apigee organization ID |

## Authentication

This extension uses Google Cloud Application Default Credentials (ADC) for authentication. Make sure your environment is properly configured with the necessary credentials and permissions to access the Apigee Management API.

Required OAuth scope: `https://www.googleapis.com/auth/cloud-platform`
