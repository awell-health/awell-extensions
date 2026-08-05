export type DisclaimerPlacement = 'top' | 'bottom'

export const DEFAULT_DISCLAIMER_PLACEMENT: DisclaimerPlacement = 'top'

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
