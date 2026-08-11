import z from 'zod'

export const DisclaimerPlacementEnum = z.enum(['top', 'bottom'])
export type DisclaimerPlacement = z.infer<typeof DisclaimerPlacementEnum>

export const DEFAULT_DISCLAIMER_PLACEMENT: DisclaimerPlacement = 'top'

export const normalizeOptionalText = (value: unknown): string | undefined => {
  if (value === null || value === undefined) return undefined
  if (typeof value !== 'string') return undefined

  const trimmedValue = value.trim()
  return trimmedValue === '' ? undefined : value
}

export const OptionalDisclaimerTextSchema = z.preprocess(
  normalizeOptionalText,
  z.string().optional(),
)

export const OptionalDisclaimerPlacementSchema = z.preprocess((value) => {
  if (value === null || value === undefined || value === '') return undefined
  if (typeof value === 'string') return value.trim().toLowerCase()
  return value
}, DisclaimerPlacementEnum.optional())

export const resolveDisclaimerConfig = ({
  actionDisclaimerText,
  actionDisclaimerPlacement,
  tenantDisclaimerText,
  tenantDisclaimerPlacement,
  defaultDisclaimer,
}: {
  actionDisclaimerText?: string
  actionDisclaimerPlacement?: DisclaimerPlacement
  tenantDisclaimerText?: string
  tenantDisclaimerPlacement?: DisclaimerPlacement
  defaultDisclaimer: string
}): { disclaimer: string; placement: DisclaimerPlacement } => ({
  disclaimer: actionDisclaimerText ?? tenantDisclaimerText ?? defaultDisclaimer,
  placement:
    actionDisclaimerPlacement ??
    tenantDisclaimerPlacement ??
    DEFAULT_DISCLAIMER_PLACEMENT,
})

export const formatSummaryWithDisclaimer = ({
  summary,
  disclaimer,
  placement = DEFAULT_DISCLAIMER_PLACEMENT,
}: {
  summary: string
  disclaimer: string
  placement?: DisclaimerPlacement
}): string => {
  return placement === 'bottom'
    ? `${summary}\n\n${disclaimer}`
    : `${disclaimer}\n\n${summary}`
}
