export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type RequestOptions = {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: unknown;
    auth?: boolean;
};

function getAccessToken(): string | null {
    if (typeof window === "undefined") {
        return null;
    }

    return (
        localStorage.getItem("ss_utsav_access_token") ||
        sessionStorage.getItem("ss_utsav_access_token")
    );
}

function clearAuthentication(): void {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.removeItem("ss_utsav_access_token");
    localStorage.removeItem("ss_utsav_admin");

    sessionStorage.removeItem("ss_utsav_access_token");
    sessionStorage.removeItem("ss_utsav_admin");
}

async function apiRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const {
        method = "GET",
        body,
        auth = false,
    } = options;

    const headers: HeadersInit = {
        Accept: "application/json",
    };

    if (!(body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    if (auth) {
        const token = getAccessToken();

        if (!token) {
            throw new Error("Authentication required");
        }

        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            method,
            headers,
            body:
                body !== undefined
                    ? body instanceof FormData
                        ? body
                        : JSON.stringify(body)
                    : undefined,
        }
    );

    if (response.status === 401) {
        clearAuthentication();
        throw new Error("Unauthorized");
    }

    let data: any = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        throw new Error(
            data?.detail ||
            data?.message ||
            `Request failed with status ${response.status}`
        );
    }

    return data as T;
}


// ========================================
// PUBLIC API
// ========================================

export const publicApi = {
    get: <T>(endpoint: string) =>
        apiRequest<T>(endpoint),

    post: <T>(endpoint: string, body: unknown) =>
        apiRequest<T>(endpoint, {
            method: "POST",
            body,
        }),
};


// ========================================
// ADMIN API
// ========================================

export const adminApi = {
    get: <T>(endpoint: string) =>
        apiRequest<T>(endpoint, {
            auth: true,
        }),

    post: <T>(endpoint: string, body: unknown) =>
        apiRequest<T>(endpoint, {
            method: "POST",
            body,
            auth: true,
        }),

    put: <T>(endpoint: string, body: unknown) =>
        apiRequest<T>(endpoint, {
            method: "PUT",
            body,
            auth: true,
        }),

    delete: <T>(endpoint: string) =>
        apiRequest<T>(endpoint, {
            method: "DELETE",
            auth: true,
        }),
};