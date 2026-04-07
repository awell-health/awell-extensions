---
title: Math
description: This extension adds custom actions to your care flow for simple mathematical operations.
---
# Math

This extension adds custom actions to your care flow for simple mathematical operations.

## Custom Actions

### Sum

Calculate the sum of two or more addends.

### Subtract

Calculate the difference between two numbers.

### Multiply

Multiply a series of numbers to get a final product.

### Divide

Divide two numbers.

### Generate random number

Generates a random (whole) number that falls between the ranges of two numbers [min, max].

### Assign to cohort

Deterministically assign any string value (e.g. patient ID, email, UUID) to a cohort number between 1 and a given number of cohorts. The same input will always produce the same cohort, making this action ideal for A/B testing and patient randomization.

**Inputs:**
- **Input value**: Any string used to determine the cohort assignment.
- **Number of cohorts**: The total number of cohorts to distribute inputs across (must be >= 1).

**Output:**
- **Cohort number**: An integer between 1 and the number of cohorts (inclusive).

> **Note:** When the number of cohorts changes, a patient's assigned cohort may change because the underlying hash modulo base changes. This action does not guarantee cohort stability across different values of the number of cohorts.

### Calculate date difference

Calculate the difference between two dates where "date left" is the minuend and "date right" the subtrahend.

**You can choose the unit in which you would like to see the difference expressed:**

1. Seconds: get the number of seconds between the given dates. Fractional seconds are truncated towards zero.
2. Minutes: get the signed number of full (rounded towards 0) minutes between the given dates. Fractional minutes are truncated towards zero.
3. Hours: get the number of hours between the given dates. Fractional hours are truncated towards zero.
4. Days: get the number of full day periods between two dates. Fractional days are truncated towards zero.
5. Weeks: get the number of full weeks between two dates. Fractional weeks are truncated towards zero.
6. Months: get the number of full months between the given dates. Fractional months are truncated towards zero.
7. Years: get the number of full years between the given dates.
