// Browser side of reminders: install check, permission, and saving this device on the server.
import { supabase } from "./supabase.mjs";

export const pushSupported = () =>
  typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

export const isIos = () => typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);

// True when opened from the Home Screen icon rather than a browser tab.
export const isInstalled = () =>
  typeof window !== "undefined" && (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true);

export async function registerWorker() {
  if (!("serviceWorker" in navigator)) return null;
  return navigator.serviceWorker.register("/sw.js");
}

async function authed(path, body, method = "POST") {
  const { data: { session } } = await supabase().auth.getSession();
  if (!session) throw new Error("Please sign in again.");
  const res = await fetch(path, {
    method,
    headers: { "content-type": "application/json", authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify(body),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || "Something went wrong.");
  return out;
}

const keyBytes = (base64) => {
  const s = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
};

// The subscription this browser already has, if any.
export async function currentSubscription() {
  if (!pushSupported()) return null;
  const reg = await navigator.serviceWorker.getRegistration();
  return reg ? reg.pushManager.getSubscription() : null;
}

// Asks for permission (must run from a tap), subscribes, and saves the device.
export async function turnOn() {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error(permission === "denied" ? "blocked" : "Notifications were not allowed.");
  const res = await fetch("/api/push/key");
  const { key, error } = await res.json();
  if (!key) throw new Error(error || "Reminders are not set up yet.");
  await registerWorker();
  const reg = await navigator.serviceWorker.ready;
  const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(key) }));
  await authed("/api/push/subscribe", { subscription: sub.toJSON() });
  return sub;
}

export async function turnOff() {
  const sub = await currentSubscription();
  if (!sub) return;
  await authed("/api/push/subscribe", { endpoint: sub.endpoint }, "DELETE").catch(() => {});
  await sub.unsubscribe();
}

export async function sendTest() {
  const sub = await currentSubscription();
  if (!sub) throw new Error("Turn on reminders on this device first.");
  // Save again in case the device was signed in as someone else before.
  await authed("/api/push/subscribe", { subscription: sub.toJSON() });
  return authed("/api/push/test", { endpoint: sub.endpoint });
}
