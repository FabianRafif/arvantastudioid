/**
 * Client & Server utilities for Real-time Price & Promo Synchronization
 * Enables automatic frontend UI updates when Admin updates prices or promotions,
 * without requiring any manual page refresh.
 */

export const LIVE_SYNC_CHANNEL_NAME = "arvanta_live_sync";
export const LIVE_SYNC_STORAGE_KEY = "arvanta_live_sync_trigger";

/**
 * Triggered on the client side by Admin Panel after saving prices/promotions.
 * Instantly notifies all open website tabs in 0ms!
 */
export function broadcastLiveUpdate() {
  if (typeof window === "undefined") return;

  try {
    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel(LIVE_SYNC_CHANNEL_NAME);
      channel.postMessage({ type: "LIVE_UPDATE", timestamp: Date.now() });
      channel.close();
    }
  } catch (err) {
    console.debug("BroadcastChannel not available:", err);
  }

  try {
    localStorage.setItem(LIVE_SYNC_STORAGE_KEY, String(Date.now()));
  } catch (err) {
    console.debug("localStorage sync error:", err);
  }
}
