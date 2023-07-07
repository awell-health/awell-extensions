import { checkForOverride } from "./checkForOverride/checkForOverride";
import { checkForScheduledAppointment } from "./checkForScheduledAppointment/checkForScheduledAppointment";
import { checkForChat } from "./checkForChat/checkForChat";
import { checkForCheckInOverride } from "./checkForCheckInOverride/checkForCheckInOverride";

export const actions = {
    checkForOverride,
    checkForScheduledAppointment,
    checkForChat,
    checkForCheckInOverride
}