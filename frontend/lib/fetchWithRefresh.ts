import { IAuthResponse } from "@sokal_ai_generate/shared-types";

type authResponse = Omit<IAuthResponse, "refreshToken">;

interface IFetchWithRefresh<T> {
  url: string;
  options?: RequestInit;
  onGetRefreshUserData?: (data: authResponse) => void;
  onGetData?: (data: T) => void;
  onFalseRefreshUserData?: () => void;
  onErrorMessage?: (error: { message: string }) => void;
}


let badRefreshRequest: boolean = false
export const fetchWithRefresh = async <T>({
  url,
  options = {},
  onGetData,
  onGetRefreshUserData,
  onErrorMessage,
}: IFetchWithRefresh<T>): Promise<void> => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };
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
        const responseClone = response.clone();
        const data = await responseClone.json();
        if (onGetData) {
          onGetData(data as T);
        }
      } else if (response.status === 401) {
        const refreshResponse = await fetch("/api/users/refresh");
        badRefreshRequest = true
        if (refreshResponse.ok) {
          badRefreshRequest = false
          const refreshResponseClone = refreshResponse.clone();
          const refreshedData: authResponse = await refreshResponseClone.json();
          const accessToken = refreshedData.accessToken;
          localStorage.setItem("accessToken", accessToken);
          if (onGetRefreshUserData) {
            onGetRefreshUserData(refreshedData);
          }
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        if (onErrorMessage) {
          onErrorMessage({ message: error.message });
        }
      }
    }finally{
      if(badRefreshRequest){
        localStorage.removeItem("accessToken");
        await new Promise(resolve => setTimeout(resolve, 500));
        window.location.href = "/";
        badRefreshRequest = false
      }
    }
  }
};
