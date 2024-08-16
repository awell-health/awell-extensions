---
title: Salesforce
description: SFDC is a cloud-based customer relationship management (CRM) software used to manage customer data, sales processes, marketing campaigns, and customer service activities
---

## Salesforce

SFDC is a cloud-based customer relationship management (CRM) software used to manage customer data, sales processes, marketing campaigns, and customer service activities

## Extension settings

For this extension to work, you will need to provide the below settings:

- Salesforce subdomain (https://<SUBDOMAIN>.my.salesforce.com/services/oauth2/token)
- Client ID
- Client secret
- Username*
- Password*

Username and password are optional. When specified, the Password grant will be used to authenticate with the Salesforce API. When left blank, the Client Credentials grant will be used.

## Actions

### Create a Lead

A lead is a standard Salesforce object (sObject). You can use this action to create a Lead object.