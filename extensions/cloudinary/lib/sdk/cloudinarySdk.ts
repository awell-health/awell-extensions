import { v2 as cloudinary } from 'cloudinary'

/**
 * Thin module boundary around the Cloudinary SDK so actions can be unit
 * tested with `jest.mock('../../lib/sdk/cloudinarySdk')`.
 *
 * Credentials are always passed per call (cloud_name / api_key / api_secret in
 * the options object) rather than via `cloudinary.config()`, because the
 * extension server handles many tenants in one process and the SDK config is
 * a process-wide singleton.
 */
export default cloudinary
