# Data ingestion demo

Three payloads for the `dataIngestion` endpoint, sent in order. They tell one hospital stay for patient `P-1001`
and show what the data workbench does with each.

| #   | Payload                       | What it shows                                                                                                                                                                      |
| --- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `01-admission.json`           | Patient demographics, an extra patient identifier, an Encounter at a Location and Organization referenced by identifier, and a Condition linked to that Encounter in the same POST |
| 2   | `02-follow-up-diagnosis.json` | A second Condition linked to the Encounter from payload 1, found by its `visit_id`                                                                                                 |
| 3   | `03-discharge.json`           | Upserts: the same Encounter (`V-2001`) is finished and the same Condition (`C-3001`) is resolved, with no duplicates                                                               |

## Before sending

In the demo tenant:

- Register the identifier system `https://acme.com` on the tenant. Without it, payload 1 fails as a whole.
- Install Encounter, Condition, Location and Organization in the workbench.
- Create a Location with identifier `https://acme.com` / `FAC-NORTH`, and an Organization with
  identifier `https://acme.com` / `ORG-ACME`. If either is missing, that reference is left empty
  and logged, and the rest still saves.
- Use a tenant on v2 care flows; only those store typed references.

Copy the endpoint URL from Data Studio's Data ingestion view.

## curl

```bash
export INGESTION_URL='<the dataIngestion URL from Data Studio>'
cd extensions/awell/v1/ingestion/__testdata__/demo

for payload in 01-admission.json 02-follow-up-diagnosis.json 03-discharge.json; do
  curl -sS -X POST "$INGESTION_URL" \
    -H 'Content-Type: application/json' \
    --data-binary "@$payload"
  echo
done
```

## Postman

Create a `POST {{ingestionUrl}}` request with the body set to raw JSON, and paste in each file in turn.
