import { getChatGPTUser } from "../chatgpt-auth";

export const ADMIN_EMAILS = [
  "cheston.sammie@gmail.com",
  "deomegapoint@gmail.com",
] as const;

export async function requirePlatformAdmin() {
  const user = await getChatGPTUser();
  if (!user) throw new Error("Authentication required");
  if (!ADMIN_EMAILS.includes(user.email.toLowerCase() as (typeof ADMIN_EMAILS)[number])) {
    throw new Error("Administrator access required");
  }
  return user;
}
