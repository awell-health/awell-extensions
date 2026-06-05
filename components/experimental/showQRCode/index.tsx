import React, { useEffect, useState } from 'react'
import { toDataURL } from 'qrcode'
import type { ComponentProps } from '@awell-health/extensions-core'

const ShowQRCodeComponent: React.FC<ComponentProps> = ({
  activityDetails,
  onSubmit,
}) => {
  const url =
    activityDetails.fields.find((field) => field.id === 'url')?.value ?? ''
  const label =
    activityDetails.fields.find((field) => field.id === 'label')?.value ?? ''

  const [qrCodeImageUrl, setQrCodeImageUrl] = useState<string>()

  useEffect(() => {
    if (url !== '') {
      void toDataURL(url, { scale: 7 }).then((dataUrl) => {
        setQrCodeImageUrl(dataUrl)
      })
    }
  }, [url])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        padding: '32px 16px',
        textAlign: 'center',
      }}
    >
      {label !== '' && (
        <p style={{ margin: 0, fontSize: '16px', maxWidth: '320px' }}>
          {label}
        </p>
      )}
      {qrCodeImageUrl !== undefined ? (
        <img src={qrCodeImageUrl} alt="QR code" />
      ) : (
        <div style={{ width: 224, height: 224, background: '#f0f0f0', borderRadius: '8px' }} />
      )}
      <button
        onClick={() => {
          void onSubmit({})
        }}
        style={{
          marginTop: '8px',
          padding: '10px 24px',
          fontSize: '15px',
          cursor: 'pointer',
          borderRadius: '6px',
          border: '1px solid #ccc',
          background: '#fff',
        }}
      >
        Done — nurse has scanned the code
      </button>
    </div>
  )
}

export default ShowQRCodeComponent
