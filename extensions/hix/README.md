---
title: Hix
description: Integration with ChipSoft HiX — create tasks on the care provider's worklist.
---

# ChipSoft HiX

Integration with ChipSoft HiX. Allows Awell care flows to push tasks directly to the HiX worklist.

## Extension settings

| Setting | Required | Description |
|---|---|---|
| API URL | Yes | Full URL of the HiX task endpoint (e.g. the `incoming-task` endpoint) |
| API key | No | Optional shared secret, sent as the `x-demo-key` header |

## Actions

### Create task

Posts a task to the HiX worklist. The task appears on "Mijn werklijst" and can be launched directly from HiX.

**Fields:** Patient ID, Patient name, Task title, Task description, Requester (defaults to `ZTOP`), Launch URL

**Data points returned:** `taskId`, `statusCode`
