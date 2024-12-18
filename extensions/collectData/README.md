---
title: Advanced data collection
description: Collect data from your users using a variety of input types and data sources
---

This extension allows you to collect data from your users using a variety of more advanced input types and data sources.

## Extension settings

In order to set up this extension, no settings are required.

## Custom Actions

### Dynamic choice selector

Standard select questions in Awell forms have a discrete set of choices to select from that are defined at the time that the form is created. If the list of choices to present to your responders isn't known at the time the form is being built, or changes often, this action allows you to load choices dynamically from a remote data source.

Dynamically-loaded choices must minimally adhere to the following format in a list form (i.e. an array):

```json
[
  {
    "id": "unique-id-1",
    "label": "Choice label 1",
    "value": "Choice value 1"
  },
  {
    "id": "unique-id-2",
    "label": "Choice label 2",
    "value": "Choice value 2"
  }
]
```

The `id`, `label`, and `value` fields are required. However, additional fields can be added to the object. Besides the `label` and `value`, which are available as distinct data points, the additional data of the selected choice will also be returned as a data point.

Example:

```json
[
  {
    "id": "unique-id-1",
    "label": "Choice label 1",
    "value": "Choice value 1",
    "additionalData": "Additional data",
    "nestedData": {
      "nested": "value"
    }
  }
]
```

Additionally, you can specify a free text search field (`Options - Search query param` field) to allow users to search through the choices. This is optional but highly recommended. If not specified, the choices will be fetched on question load and presented in a static list that cannot be filtered.

As an example, using the endpoint `https://example.com/choices` with a query parameter `search` (e.g. `https://example.com/choices?search=QUERY` where `QUERY` is whatever the user typed into the input), then the API is expected to return the choices based on that match the search term.

We recommend that your search logic returns an _alphabetically-sorted_ list of all options where the _lowercase_ label names _contain_ the _lowercase_ search term.

```js
// Example search logic
const searchTerm = req.query.search
const results = []

options.forEach((option) => {
  if (option.label.toLowerCase().includes(searchTerm.toLowerCase())) {
    results.push({
      label: option.label,
      value: option.value,
      id: option.id,
    })
  }
})

const sortedResults = results.sort((a, b) => a.label.localeCompare(b.label))
res.json(results)
```

### Collect medication

This action enables patients to list their medications. They can add multiple medications, providing the name, dosage, and any specific instructions for each one.
