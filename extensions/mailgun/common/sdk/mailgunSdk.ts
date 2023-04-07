import FormData from 'form-data'
import Mailgun from 'mailgun.js'

const mailgunSdk = new Mailgun(FormData)

export default mailgunSdk
