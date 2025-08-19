import { 
  listApis, 
  listProxiesWithDeployments, 
  listApiProducts,
  ensureDeveloper,
  createDeveloperAppAndApproveKey,
  rotateKeyWithOverlap,
  revokeKeyOrSuspendApp,
  kvmGet,
  kvmSet,
  deploymentStatusSnapshot,
  opsSnapshot
} from './actions'
import { type Extension } from '@awell-health/extensions-core'
import { settings } from './settings'
import { AuthorType, Category } from '@awell-health/extensions-core'

export const Apigee: Extension = {
  key: 'apigee',
  title: 'Apigee',
  description:
    'Integration with Google Cloud Apigee API Management platform to list and manage API proxies.',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1678870116/Awell%20Extensions/apigee-icon.png',
  category: Category.EHR_INTEGRATIONS,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions: {
    listApis,
    listProxiesWithDeployments,
    listApiProducts,
    ensureDeveloper,
    createDeveloperAppAndApproveKey,
    rotateKeyWithOverlap,
    revokeKeyOrSuspendApp,
    kvmGet,
    kvmSet,
    deploymentStatusSnapshot,
    opsSnapshot,
  },
}
