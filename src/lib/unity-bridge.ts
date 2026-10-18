// Bridge to the Android WebView app, which runs the Unity Ads SDK natively.
// The Android app injects `window.UnityAdsBridge` (addJavascriptInterface) and calls back
// window.__unityAdResult(requestId, status) where status is "completed" | "skipped" | "failed".

type Bridge = { showRewarded: (requestId: string) => void; showInterstitial?: (requestId: string) => void; isReady?: () => boolean };
type Result = "completed" | "skipped" | "failed";

declare global {
  interface Window {
    UnityAdsBridge?: Bridge;
    __unityAdResult?: (requestId: string, status: string) => void;
  }
}

const pending = new Map<string, (r: Result) => void>();

function install() {
  if (typeof window === "undefined" || window.__unityAdResult) return;
  window.__unityAdResult = (id, status) => {
    const cb = pending.get(id);
    if (!cb) return;
    pending.delete(id);
    cb(status === "completed" ? "completed" : status === "skipped" ? "skipped" : "failed");
  };
}

export function hasUnityAds() {
  return typeof window !== "undefined" && !!window.UnityAdsBridge?.showRewarded;
}

// Shows a rewarded video in the Android app. Resolves when the SDK reports the result.
export function showUnityRewarded(timeoutMs = 120_000): Promise<Result> {
  install();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return new Promise((resolve) => {
    const timer = setTimeout(() => { pending.delete(id); resolve("failed"); }, timeoutMs);
    pending.set(id, (r) => { clearTimeout(timer); resolve(r); });
    try { window.UnityAdsBridge!.showRewarded(id); } catch { pending.delete(id); clearTimeout(timer); resolve("failed"); }
  });
}

export function showUnityInterstitial() {
  install();
  try { window.UnityAdsBridge?.showInterstitial?.(`i-${Date.now()}`); } catch { /* ignore */ }
}
