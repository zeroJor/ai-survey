import type { Invite } from "../types";

export const defaultInvite: Invite = {
  contactName: "María",
  businessName: "Café Luna",
};

export function fillTemplate(
  text: string,
  invite: Invite,
): string {
  return text
    .replace(/\{\{contactName\}\}/g, invite.contactName)
    .replace(/\{\{businessName\}\}/g, invite.businessName);
}
