import { getPatient } from './patient/get'
import { updatePatient } from './patient/update'
import { createPatient } from './patient/create'
import { enrollRealTimeMonitoring } from './patient/enrollRealTimeMonitoring'
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
  enrollRealTimeMonitoring,
  updatePatient,
  deletePatient,
  listDocuments,
  queryDocs,
  getUrl,
  startNetworkQuery,
  startConsolidatedQuery,
  getConsolidatedQueryStatus,
}
