# Medplum changelog

## [Unreleased]

### Added
- Added `resourcesCreated` JSON data point to `createResource` action for bundle operations
  - Provides structured array with resource ID, type, status, and location for each created resource
  - Enables filtering and accessing specific resources by type in care flows using derived data points
  - Maintains backward compatibility with existing `resourceIds` data point
  - Location format simplified to `ResourceType/id` (removed `_history` suffix)
