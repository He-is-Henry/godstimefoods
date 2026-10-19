import { apiClient } from "@/lib/apiClient";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerPushNotifications() {
  console.log("[Push Registration] Starting push notification setup...");

  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn(
      "[Push Registration] Push notifications are not supported on this browser/environment.",
    );
    return;
  }

  // 1. Request Notification Permission
  const permission = await Notification.requestPermission();
  console.log(
    `[Push Registration] Notification permission status: "${permission}"`,
  );

  if (permission !== "granted") {
    console.warn(
      "[Push Registration] Notification permission was denied by user.",
    );
    return;
  }

  // 2. Register Service Worker
  console.log("[Push Registration] Registering Service Worker /sw.js ...");
  const registration = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;
  console.log("[Push Registration] Service Worker is active and ready.");

  // 3. Get existing or create new subscription
  let subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    console.log(
      "[Push Registration] Existing push subscription found on device:",
      subscription,
    );
  } else {
    console.log(
      "[Push Registration] No existing subscription found. Generating a new subscription...",
    );
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    if (!vapidPublicKey) {
      console.error(
        "[Push Registration] Error: NEXT_PUBLIC_VAPID_PUBLIC_KEY is not defined in environment variables!",
      );
      return;
    }

    const convertedKey = urlBase64ToUint8Array(vapidPublicKey);
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedKey,
    });
    console.log(
      "[Push Registration] Successfully subscribed with browser PushManager:",
      subscription,
    );
  }

  // 4. Extract clean payload (strips expirationTime to satisfy NestJS DTO validator)
  const jsonSub = subscription.toJSON();
  const payload = {
    endpoint: jsonSub.endpoint,
    keys: jsonSub.keys,
  };

  console.log(
    "[Push Registration] Sending cleaned payload to NestJS (/push/subscribe):",
    payload,
  );

  try {
    const response = await apiClient.post("/push/subscribe", payload);
    console.log(
      "[Push Registration] Backend successfully saved subscription:",
      response,
    );
  } catch (error) {
    console.error(
      "[Push Registration] Failed to send subscription to backend:",
      error,
    );
    throw error;
  }
}
