import { useState, useCallback, useRef } from 'react';
import type { ApiResponse, ApiError } from '../services';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  onFinally?: () => void;
}

export function useApi<T = any>() {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const callApi = useCallback(async <R = T>(
    apiCall: () => Promise<ApiResponse<R>>,
    options?: UseApiOptions<R>
  ): Promise<ApiResponse<R> | null> => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);
    setProgress(null);

    try {
      const response = await apiCall();

      if (response.success && response.data) {
        setData(response.data as any);
        options?.onSuccess?.(response.data);
        return response;
      }

      throw {
        message: response.message || 'Request failed',
        status: response.status,
      } satisfies ApiError;
    } catch (err: any) {
      const apiError = err as ApiError;

      if (
        apiError.message !== 'Request timeout. Please try again.' &&
        !apiError.message?.includes('AbortError')
      ) {
        setError(apiError);
        options?.onError?.(apiError);
      }

      return null;
    } finally {
      setLoading(false);
      setProgress(null);
      abortControllerRef.current = null;
      options?.onFinally?.();
    }
  }, []);

  const uploadWithProgress = useCallback(async <R = T>(
    apiCall: (onProgress: (progress: number) => void) => Promise<ApiResponse<R>>,
    options?: UseApiOptions<R>
  ): Promise<ApiResponse<R> | null> => {
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const response = await apiCall((pct) => setProgress(pct));

      if (response.success && response.data) {
        setData(response.data as any);
        setProgress(100);
        options?.onSuccess?.(response.data);
        return response;
      }

      throw {
        message: response.message || 'Upload failed',
        status: response.status,
      } satisfies ApiError;
    } catch (err: any) {
      const apiError = err as ApiError;
      setError(apiError);
      options?.onError?.(apiError);
      return null;
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(null), 800);
      options?.onFinally?.();
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    setProgress(null);

    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, []);

  return {
    data,
    error,
    loading,
    progress,
    callApi,
    uploadWithProgress,
    reset,
    setData,
    setError,
  };
}

import { authService } from '../services/authService';

export function useAuth() {
  const user = authService.getStoredUser();
  const authenticated = authService.isAuthenticated();

  return {
    user,
    authenticated,
    isAdmin: user?.is_staff ?? false,
  };
}