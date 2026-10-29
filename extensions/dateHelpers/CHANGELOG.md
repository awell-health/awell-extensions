# Date helopers

## Unreleased

- "Check working hours" action: `minutesToNextWorkingHours` now counts the real minutes until the next start of working hours when a DST change falls in between (it was 60 minutes off), and `nextWorkingHoursDatetime` no longer carries over the seconds and milliseconds of the current time.
