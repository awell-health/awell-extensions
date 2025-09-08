---
title: Transform
description: Transform is an extension with utility functions that allows you to transform or parse data to a format of your liking
---

# Transform

Transform is an extension on Awell's Marketplace with utility functions that allows you to transform data from one type to another. These functions are particularly useful e.g. when system A works with IDs that are numbers but system B works with IDs that are strings.

## Custom Actions

### Parse number to text

Transform or parse a number to text (string).

### Parse text to number

Transform or parse text (string) to a number. Will return NaN if the input data is not an actual number.

### Parse date to unix timestamp

Transform or parse a date to a unix timestamp.

### Parse unix timestamp to unix date

Transform or parse a unix timestamp to a date.

## Parse number to text with dictionary

Transform or parse a number to a string using a dictionary. Useful for when you have numeric data points but want to map them to strings based on a dictionary. When the action is called with a number that does not have a corresponding mapping in the provided dictionary, it simply returns the number itself as a string. 

The dictionary should be structured in JSON format with string keys mapping to string values. Each key represents a number (as a string), and each value is the corresponding text representation.

**Example:**
```json
{
  "0": "Male",
  "1": "Female",
  "2": "Not known",
  // ... other number mappings ...
}
```

## Generate dynamic URL

Generate a dynamic URL based on a URL template with placeholder and a data point value.

```
urlTemplate   https://your-url.com/{{placeholder}}
value         hello-world
outcome       https://your-url.com/hello-world
```

## Feet and inches to inches

Converts a measurement in feet and inches to just inches.

## Combine date and time

Combines a reference date with a time string to create a complete datetime in UTC format. This action supports two input formats for the time string:

1. **Simple time format (HH:mm:ss)**: Combines the reference date with the specified time in ISO format (e.g., "14:30:00" not "2PM")
2. **Full datetime with timezone**: Accepts ISO8601 datetime strings with timezone offsets and converts them to UTC

**Examples:**

**Example 1 - Simple time combination:**
```
Reference date: 2025-09-13
Time string: 17:45:00
Result: 2025-09-13T17:45:00Z
```

**Example 2 - Reference date precedence with timezone-aware datetime:**
```
Reference date: 2025-09-01
Time string: 2025-09-06T15:34:44+02:00
Result: 2025-09-01T13:34:44Z (reference date takes precedence, time converted from +02:00 to UTC)
```

**Example 3 - Different timezone offset:**
```
Reference date: 2025-09-06
Time string: 2025-09-06T10:30:00-05:00
Result: 2025-09-06T15:30:00Z (converted from -05:00 to UTC)
```

This action is particularly useful for scheduling systems like Bland API where you need to combine dates and times from different sources, or when working with timezone-aware scheduling data that needs to be normalized to UTC.
