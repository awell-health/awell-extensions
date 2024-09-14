---
title: Hubspot
description: HubSpot is a customer relationship management (CRM) platform that provides a suite of tools for marketing, sales, customer service, and content management.
---

## Hubspot

HubSpot is a customer relationship management (CRM) platform that offers a comprehensive suite of tools for marketing, sales, customer service, and content management. It is widely recognized for its user-friendly interface and inbound marketing methodology, which focuses on attracting customers through valuable content and experiences instead of traditional advertising.

HubSpot provides features like email marketing, social media management, lead generation, analytics, and automation to help businesses attract, engage, and delight customers.

## Settings and Setup

To use the HubSpot extension, you need an access token to authenticate with the HubSpot API. We recommend creating a [private app](https://developers.hubspot.com/docs/api/private-apps) in your HubSpot account for Awell and using the provided access token. You should only provide the minimum scopes necessary for the actions you intend to use. The required scopes for each action are listed in the documentation below.

### SMTP Authentication

If you plan to use the "Send email with SMTP" action, you will need to provide your username and password to authenticate requests to HubSpot's SMTP server.

### Add-ons

Sending transactional emails via HubSpot requires you to add the [corresponding add-ons](https://knowledge.hubspot.com/marketing-email/how-to-use-transactional-email-in-hubspot) to your HubSpot account.

## Actions

### Get contact

Retrieve the details of a contact based on the provided contact ID.

Scope: `crm.objects.contacts.read`

### Send email with SMTP

Send an email using HubSpot's SMTP server.

Sending emails via SMTP has some limitations. The most significant drawback is that you cannot use templates or apply styling when sending emails through SMTP. SMTP is generally more manual and less integrated with HubSpot's smart content and template features.

Scope: N/A

### Send email with Single Send API

The Single Send API is the recommended method for sending transactional emails with HubSpot. You can create email templates in your HubSpot account and use this action to send emails to recipients. This method allows you to take advantage of features like smart content and personalization.

Scope: `transactional-email`
