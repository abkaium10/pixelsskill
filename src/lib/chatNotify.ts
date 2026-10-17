/**
 * Extension hooks for notifications. They do nothing by default (the chat works through the admin inbox and polling).
 * To get email/Slack alerts, call your provider from these two functions — no other file needs to change.
 */
export async function onVisitorMessage(_s: { id: string; visitorEmail: string | null; visitorName: string | null }, _m: { body: string }): Promise<void> { /* e.g. send a Slack/email alert to staff */ }
export async function onAdminReply(_s: { id: string; visitorEmail: string | null }, _m: { body: string }): Promise<void> { /* e.g. email the visitor if they left an address */ }
