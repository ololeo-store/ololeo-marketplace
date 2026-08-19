let loadPromise: Promise<void> | null = null;

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        callbacks: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

export function loadMidtransSnap(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Midtrans Snap hanya bisa dimuat di browser"));
  }
  if (window.snap) {
    return Promise.resolve();
  }
  if (loadPromise) {
    return loadPromise;
  }

  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
  if (!clientKey) {
    return Promise.reject(new Error("Midtrans belum dikonfigurasi"));
  }

  const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
  const src = isProduction
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.setAttribute("data-client-key", clientKey);
    script.onload = () => resolve();
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Gagal memuat Midtrans Snap"));
    };
    document.body.appendChild(script);
  });

  return loadPromise;
}

export type SnapOutcome = "success" | "pending" | "error" | "closed";

export async function paySnap(token: string): Promise<SnapOutcome> {
  await loadMidtransSnap();

  return new Promise((resolve) => {
    window.snap!.pay(token, {
      onSuccess: () => resolve("success"),
      onPending: () => resolve("pending"),
      onError: () => resolve("error"),
      onClose: () => resolve("closed"),
    });
  });
}
