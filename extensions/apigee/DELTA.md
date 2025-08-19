# Apigee Extension Plan Changes

## What Changed vs Original Phase 1-4 Plan

### REMOVED (Platform Admin Focus)
- `createApiProxy` - Upload and create new API proxies
- `deployApiProxy` - Deploy specific revisions to environments  
- `undeployApiProxy` - Remove deployments from environments
- `createApiProduct` - Bundle APIs into products

### ADDED (Awell-Focused Operations)

#### Access Management (4 actions)
- `ensureDeveloper` - Idempotent developer creation/retrieval
- `createDeveloperAppAndApproveKey` - Bind selected products to developer apps
- `rotateKeyWithOverlap` - Issue new key with overlap window
- `revokeKeyOrSuspendApp` - Emergency kill switch for access

#### Configuration (2 actions)  
- `kvmGet` - Read environment-scoped key-value pairs (non-PHI)
- `kvmSet` - Write environment-scoped key-value pairs (values redacted in logs)

#### Visibility (4 actions)
- `listProxiesWithDeployments` - Enhanced proxy list with deployment status
- `listApiProducts` - Read-only product catalog (replaces create)
- `deploymentStatusSnapshot` - Proxy x environment deployment matrix
- `opsSnapshot` - Aggregate metrics (total, errorRate, p95) for 1h/24h windows

#### Infrastructure (2 actions, P1)
- `listTargetServers` - Backend service endpoints (read-only)
- `listKeystoreAliases` - Certificate/key management visibility (read-only)

## Why This Change

**Original Plan**: Focused on CI/CD and platform administration workflows
**Revised Plan**: Focused on access provisioning, safe configuration, and lightweight operational visibility

**Awell Context**: Careflows + canvas need developer onboarding, credential management, and operational insights - not proxy deployment or product creation in Studio.

**Security**: Write operations require explicit confirmation, read operations are previewable, secrets are never logged, kvmSet values are redacted.

**Idempotency**: Developer and app creation operations return existing resources when present rather than failing.
