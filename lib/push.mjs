// Sends web push notifications to a person's saved devices. Server only.

import webpush from "web-push";

let ready = false;
function setup() {
  if (ready) return true;
  const pub = process.env.VAPID_PUBLIC_KEY?.trim();
  const priv = process.env.VAPID_PRIVATE_KEY?.trim();
  if (!pub || !priv) return false;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT?.trim() || "mailto:hello@catchit.app", pub, priv);
  ready = true;
  return true;
}

export const pushReady = () => setup();

// Sends one message to each subscription row. Removes devices the browser says are gone.
// Returns how many devices got it.
export async function sendPush(admin, subscriptions, message) {
  if (!setup()) throw new Error("Push keys are not set.");
  let sent = 0;
  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(message),
        { TTL: 6 * 3600, urgency: "high" },
      );
      sent += 1;
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) {
        await admin.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
      } else {
        console.error("push failed", err.statusCode, err.body);
      }
    }
  }
  return sent;
}

// The signed-in user from the Authorization header, or null.
export async function userFromRequest(admin, request) {
  const token = /^Bearer (.+)$/.exec(request.headers.get("authorization") ?? "")?.[1];
  if (!token) return null;
  const { data } = await admin.auth.getUser(token);
  return data?.user ?? null;
}
