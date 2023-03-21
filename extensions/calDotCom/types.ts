export interface Booking {
    id: number;
    userId: number;
    description: string;
    eventTypeId: number;
    uid: string;
    title: string;
    startTime: string;
    endTime: string;
    attendees: User[];
    user: User;
    metadata: Record<string, unknown>;
    status: string;
}

export interface User {
    email: string;
    name: string;
    timeZone: string;
    locale?: string;
}
