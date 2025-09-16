import React from "react";
import type { ComponentProps } from "@awell-health/extensions-core";

const FrontendComponent: React.FC<ComponentProps> = ({
  activityDetails,
  onSubmit
}) => {
  const [value, setValue] = React.useState('')
  return (
    <div>
      <div>Completing activity id: {activityDetails.activity_id}</div>
      <pre>{JSON.stringify(activityDetails, null, 2)}</pre>
      <input type="text" value={value} onChange={(e) => { setValue(e.target.value) }} />
      <button onClick={() => { void onSubmit({ world: String(value) }) }}>Submit</button>
    </div>
  )
}

export default FrontendComponent