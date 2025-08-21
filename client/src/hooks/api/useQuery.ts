import {
  useQuery as useReactQuery,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { AxiosError } from "axios";

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

export function useQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<ApiResponse<T>>,
  options?: Omit<
    UseQueryOptions<ApiResponse<T>, AxiosError>,
    "queryKey" | "queryFn"
  >
) {
  return useReactQuery({
    queryKey,
    queryFn,
    ...options,
  });
}
