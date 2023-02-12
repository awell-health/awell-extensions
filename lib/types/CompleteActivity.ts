export type CompleteActivity = ({
  activityId,
  token,
}: {
  activityId: string
  token: string
}) => Promise<void>
