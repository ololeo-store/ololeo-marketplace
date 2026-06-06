const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const apiUrl = getApiUrl();
  const url = path.startsWith("http") ? path : `${apiUrl}${path}`;
  
  // Get current access token
  let token = typeof window !== "undefined" ? localStorage.getItem("ololeo_admin_token") : null;
  
  // Clone or prepare headers
  const headers = new Headers(options.headers || {});
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  // Perform initial request
  let response = await fetch(url, fetchOptions);

  // If unauthorized, attempt to refresh the token
  if (response.status === 401 && typeof window !== "undefined") {
    // Skip refresh token logic if we are trying to login or refresh itself
    if (path.includes("/auth/login") || path.includes("/auth/refresh")) {
      return response;
    }

    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshRes = await fetch(`${apiUrl}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Send HTTP-Only Cookie
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const newToken = refreshData.access_token;
          localStorage.setItem("ololeo_admin_token", newToken);
          isRefreshing = false;
          onRefreshed(newToken);
        } else {
          isRefreshing = false;
          // Clear credentials and redirect if refresh fails
          localStorage.removeItem("ololeo_admin_token");
          localStorage.removeItem("ololeo_admin_user");
          window.location.href = "/sapanyak/login";
          return response;
        }
      } catch (err) {
        isRefreshing = false;
        return response;
      }
    }

    // Wait for refresh to complete and retry request with new token
    return new Promise((resolve, reject) => {
      subscribeTokenRefresh((newToken) => {
        const newHeaders = new Headers(fetchOptions.headers || {});
        newHeaders.set("Authorization", `Bearer ${newToken}`);
        fetch(url, { ...fetchOptions, headers: newHeaders })
          .then(resolve)
          .catch(reject);
      });
    });
  }

  return response;
}
