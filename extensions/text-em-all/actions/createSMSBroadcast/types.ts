import { z } from 'zod'

export const BroadcastTypes = z.enum([
    'SMS',
  ])

  export interface Broadcast {
    Uri: string;
    UriBroadcastDetails: string;
    BroadcastID: number;
    BroadcastName: string;
    BroadcastType: z.infer<typeof BroadcastTypes>;
    BroadcastStatus: string;
    BroadcastStatusCategory: string;
    CreatedDate: string;
    StartDate: string;
    CompletedDate: string;
    CallerID: string | null;
    CreditsUsed: number;
    PhoneNumberCount: number;
    TotalCompleted: number;
    User: Record<string, unknown>;
    // Text broadcast specific fields
    TextMessage?: string;
    DeliveredTexts?: number;
    NotDeliveredTexts?: number;
    InvalidTextCount?: number;
    FailedTextTotal?: number;
    TextReplies?: number;
    UnreadTextReplies?: number;
    UnreadConversationReplies?: number;
    NotRepliedTotal?: number;
    TextOptedOut?: number;
    TextNumberID?: number;
    TextPhoneNumber?: string;
    TextBroadcastID?: string;
    // Failed contacts information
    FailedContacts?: Array<Record<string, unknown>>;
  }



