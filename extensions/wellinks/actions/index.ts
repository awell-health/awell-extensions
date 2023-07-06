import { checkForOverride } from "./checkForOverride/checkForOverride";
import { checkForScheduledAppointment } from "./checkForScheduledAppointment/checkForScheduledAppointment";
import { checkForChat } from "./checkForChat/checkForChat";
import { checkForCheckInOverride } from "./checkForCheckInOverride/checkForCheckInOverride";
import { unenrollFromSendgrid } from "./unenrollFromSendgrid/unenrollFromSendgrid";

export const actions = {
    checkForOverride,
    checkForScheduledAppointment,
    checkForChat,
    checkForCheckInOverride,
    unenrollFromSendgrid
}