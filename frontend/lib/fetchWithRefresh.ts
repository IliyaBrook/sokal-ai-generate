import { IAuthResponse } from "@sokal_ai_generate/shared-types";

type authResponse = Omit<IAuthResponse, 'refreshToken'>

interface IfetchWithRefresh <T> {
  url: string;
  options?: RequestInit;
  onGetRefreshUserData: (data: authResponse) => void;
  onGetData: (data: T) => void;
  onFalseRefreshUserData: () => void;
  onErrorMessage: (error: { message: string }) => void;
}

export const fetchWithRefresh = async <T>({
  url,
  options = {},
  onGetData,
  onGetRefreshUserData,
  onFalseRefreshUserData,
  onErrorMessage,
}: IfetchWithRefresh<T>) => {
  const token = localStorage.getItem("accessToken");
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
    const fetchOptions: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...((options.headers as Record<string, string>) || {}),
      },
    };
    try {
      const response = await fetch(url, fetchOptions);

      if (response.ok) {
        const data = await response.json();
        onGetData(data as T);
      } else if (response.status === 401) {
        const refreshResponse = await fetch("/api/users/refresh");
        if (refreshResponse.ok) {
          const refreshedData: authResponse = await refreshResponse.json();
          const accessToken = refreshedData.accessToken;
          localStorage.setItem("accessToken", accessToken);
          onGetRefreshUserData(refreshedData);
        } else {
          onFalseRefreshUserData();
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        onErrorMessage({ message: error.message });
      }
    }
  }
};