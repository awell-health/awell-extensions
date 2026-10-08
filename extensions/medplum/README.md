---
title: Medplum
description: Medplum is the open source healthcare developer platform that helps you build, test, and deliver any healthcare product or service.
---

# Medplum

Medplum is the open source healthcare developer platform that helps you build, test, and deliver any healthcare product or service.

## Extension settings

The following settings are required to configure the Medplum extension:

- **Client ID**: Used to authenticate with Medplum's API (required)
- **Client Secret**: Used to authenticate with Medplum's API (required)
- **Base URL**: Optional custom base URL for your Medplum server (e.g., `https://api.medplum.com/`). Leave empty to use the default Medplum server.

## Execute stored bundle

Executes a FHIR Bundle in Medplum, reading it from a reference (a stored object) instead of from a field, so a bundle too large to pass between care flow steps can still be imported. It takes one field, `bundleRef`: the reference an action that stores a bundle returned, such as the `transactionBundleRef` of the Metriport **Store Webhook Bundle** action.

What the reference points at is one of:

- **A transaction or batch Bundle**, executed as it is. A `collection` or any other type is refused before anything is sent: the raw `bundleRef` of **Store Webhook Bundle** is a `collection`, an easy one to wire in by mistake.
- **A list of transaction bundles** (`kind: "transaction-chunks"`), which is what **Store Webhook Bundle** returns for a bundle it has split. Each is read when it is about to be sent and is sent on its own, **one after another**, in the order listed: a later one can refer, by a conditional reference, to what an earlier one wrote. The first that Medplum rejects ends the action, as what comes after may depend on what was not written. The error says which one it was (`chunk 6 of 40`), its reference, where in the source bundle its entries came from, and how many had been executed, which stay in Medplum. Run the action again and it sends them all again: the transactions are written so that sending one again replaces what it wrote.

| Data point | Type | Description |
| --- | --- | --- |
| `bundleId` | string | The id of the result Medplum gave, for a single bundle. Empty for a list of transactions, which have one each. |
| `bundleType` | string | The type of the bundle executed. |
| `chunkCount` | number | How many bundles were sent to Medplum: 1 for a stored bundle. |
| `entryCount` | number | How many entries those bundles held, in all, including the account Organization and the Provenance each transaction of a split bundle carries. |

What Medplum did with each resource is not returned: it grows with the bundle, and a bundle too large to pass between steps can be answered by a result that is too large too. The action cannot be previewed, and nothing of the bundle is written to the log.

