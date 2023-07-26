/**
 * Declares some missing types for `docusign-esign` sdk
 */
/* eslint-disable @typescript-eslint/no-extraneous-class */
import type DocuSignSdk from 'docusign-esign'

// ! SDK is lacking 60% of types -> must declare it by yourself
declare module 'docusign-esign' {
  class Signer implements DocuSignSdk.Signer {
    static constructFromObject: (data: DocuSignSdk.Signer) => DocuSignSdk.Signer
  }

  class CarbonCopy implements DocuSignSdk.CarbonCopy {
    static constructFromObject: (
      data: DocuSignSdk.CarbonCopy
    ) => DocuSignSdk.CarbonCopy
  }

  class Recipients implements DocuSignSdk.Recipients {
    static constructFromObject: (
      data: DocuSignSdk.Recipients
    ) => DocuSignSdk.Recipients
  }

  class CompositeTemplate implements DocuSignSdk.CompositeTemplate {
    static constructFromObject: (
      data: DocuSignSdk.CompositeTemplate
    ) => DocuSignSdk.CompositeTemplate
  }

  class ServerTemplate implements DocuSignSdk.ServerTemplate {
    static constructFromObject: (
      data: DocuSignSdk.ServerTemplate
    ) => DocuSignSdk.ServerTemplate
  }

  class InlineTemplate implements DocuSignSdk.InlineTemplate {
    static constructFromObject: (
      data: DocuSignSdk.InlineTemplate
    ) => DocuSignSdk.InlineTemplate
  }

  class EnvelopeDefinition implements DocuSignSdk.EnvelopeDefinition {
    static constructFromObject: (
      data: DocuSignSdk.EnvelopeDefinition
    ) => DocuSignSdk.EnvelopeDefinition
  }

  class RecipientViewRequest implements DocuSignSdk.RecipientViewRequest {
    static constructFromObject: (
      data: DocuSignSdk.RecipientViewRequest
    ) => DocuSignSdk.RecipientViewRequest
  }

  class TemplateRole implements DocuSignSdk.TemplateRole {
    static constructFromObject: (
      data: DocuSignSdk.TemplateRole
    ) => DocuSignSdk.TemplateRole
  }
}
