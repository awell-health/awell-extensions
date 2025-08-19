# Apigee Extension

This extension integrates with Google Cloud Apigee API Management platform for access provisioning, safe configuration, and lightweight operational visibility.

## Actions

### Access Management
- **ensureDeveloper**: Creates a developer if they don't exist, or returns existing developer information (idempotent)
- **createDeveloperAppAndApproveKey**: Creates a developer application with API key and binds it to specified API products (idempotent)
- **rotateKeyWithOverlap**: Issues a new API key while keeping the old key valid for a specified overlap period
- **revokeKeyOrSuspendApp**: Emergency kill switch to revoke a specific API key or suspend an entire developer application

### Configuration
- **kvmGet**: Retrieves a value from an environment-scoped key-value map
- **kvmSet**: Sets a value in an environment-scoped key-value map (values are redacted in logs)

### Visibility
- **listApis**: Lists all API proxies in the organization
- **listProxiesWithDeployments**: Lists API proxies with their deployment status across environments
- **listApiProducts**: Lists all API products in the organization
- **deploymentStatusSnapshot**: Provides a snapshot of deployment status for all proxies across environments
- **opsSnapshot**: Provides aggregate operational metrics (total, error rate, p95) for 1-hour and 24-hour windows

## Sample Inputs

### ensureDeveloper
```json
{
  "email": "developer@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

### createDeveloperAppAndApproveKey
```json
{
  "developerId": "developer@example.com",
  "appName": "my-app",
  "apiProducts": "product1,product2"
}
```

### kvmGet
```json
{
  "environment": "prod",
  "mapName": "config",
  "key": "api_endpoint"
}
```

### opsSnapshot
```json
{
  "environment": "prod"
}
```

## Settings

- `gcpProjectId`: Google Cloud Project ID
- `apigeeOrgId`: Apigee Organization ID  
- `credentialsStrategy`: Authentication strategy (default: ADC)

## Authentication

Uses Google Application Default Credentials (ADC) with the `https://www.googleapis.com/auth/cloud-platform` scope.

## Security Considerations

- Write operations require explicit confirmation and are not previewable
- Read operations are previewable for safe testing
- KVM values are redacted in all logs and outputs
- API keys and secrets are never logged
- Idempotent operations return existing resources when present
