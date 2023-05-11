import { createOrganization } from './organization/create'
import { updateOrganization } from './organization/update'
import { getOrganization } from './organization/get'
import { createFacility } from './facility/create'
import { updateFacility } from './facility/update'
import { getFacility } from './facility/get'

export const actions = {
  createOrganization,
  updateOrganization,
  getOrganization,
  createFacility,
  updateFacility,
  getFacility,
}
