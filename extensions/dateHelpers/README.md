---
title: Date helpers
description: A set of utility actions to help with common and useful date and time operations.
---

# Date helpers

A set of utility actions to help with common and useful date and time operations.

## Actions

### Get next workday

Returns the next workday (Monday to Friday) based on a reference date.

If the reference date is a weekday and "Include reference date" is enabled, the reference date is returned. If it's a weekend or "Include reference date" is disabled, the next weekday is returned instead.

**Examples:**

- Reference date: Thursday, April 17
    - Include reference date enabled → returns Thursday, April 17
    - Include reference date disabled → returns Friday, April 18
- Reference date: Sunday, April 20
    - Include reference date enabled → returns Monday, April 21
    - Include reference date disabled → returns Monday, April 21

✅ Include reference date enabled or disabled → returns Monday, April 21

This action does not account for holidays.