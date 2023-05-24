import { getPatient } from './patient/get'
import { updatePatient } from './patient/update'
import { createPatient } from './patient/create'
import { deletePatient } from './patient/delete'
import { getAllLinks } from './link/getAll'
import { createLink } from './link/create'
import { removeLink } from './link/remove'
import { listDocuments } from './document/list'
import { queryDocs } from './document/query'
import { getUrl } from './document/getUrl'

export const actions = {
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  getAllLinks,
  createLink,
  removeLink,
  listDocuments,
  queryDocs,
  getUrl,
}
