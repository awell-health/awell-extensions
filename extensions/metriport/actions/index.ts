import { getPatient } from './patient/get'
import { updatePatient } from './patient/update'
import { createPatient } from './patient/create'
import { deletePatient } from './patient/delete'
import { listDocuments } from './document/list'
import { queryDocs } from './document/query'
import { getUrl } from './document/getUrl'
import { startNetworkQuery } from './network/startNetworkQuery'
import { startConsolidatedQuery } from './consolidated/startConsolidatedQuery'
import { getConsolidatedQueryStatus } from './consolidated/getConsolidatedQueryStatus'

export const actions = {
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  listDocuments,
  queryDocs,
  getUrl,
  startNetworkQuery,
  startConsolidatedQuery,
  getConsolidatedQueryStatus,
}
