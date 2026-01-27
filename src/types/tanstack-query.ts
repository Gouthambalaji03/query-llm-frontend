import { AxiosResponse } from "axios";
import { UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import { TApiResponse, TApiSuccessResponse } from "./index";

export type TApiPromise<T> = Promise<AxiosResponse<TApiSuccessResponse<T>>>;

export type TQueryOpts<TData> = Omit<
  UseQueryOptions<AxiosResponse<TApiSuccessResponse<TData>>, Error, TData>,
  "queryKey" | "queryFn"
>;

export type TMutationOpts<TVariables, TData = void> = Omit<
  UseMutationOptions<AxiosResponse<TApiSuccessResponse<TData>>, Error, TVariables, unknown>,
  "mutationKey" | "mutationFn"
>;
