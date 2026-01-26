import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/tanstack-query";
import type { TUser, TUpdateUserInput, TPaginationParams, TPaginatedResponse } from "@/types";
import type { TApiPromise, TMutationOpts, TQueryOpts } from "@/types/tanstack-query";

export type TGetAllUsersArgs = TPaginationParams;

export type TGetAllUsersResult = TPaginatedResponse<TUser>;

export const useGetAllUsers = (
  args: TGetAllUsersArgs = {},
  options?: TQueryOpts<TGetAllUsersResult>
) => {
  return useQuery({
    queryKey: ["useGetAllUsers", args],
    queryFn: () => {
      return api.get("/users/", {
        params: args,
      }) as TApiPromise<TGetAllUsersResult>;
    },
    ...options,
  });
};

export type TGetUserArgs = {
  userId: string;
};

export type TGetUserResult = TUser;

export const useGetUser = (args: TGetUserArgs, options?: TQueryOpts<TGetUserResult>) => {
  return useQuery({
    queryKey: ["useGetUser", args],
    queryFn: () => {
      return api.get(`/users/${args.userId}`) as TApiPromise<TGetUserResult>;
    },
    enabled: !!args.userId,
    ...options,
  });
};

export type TUpdateUserArgs = {
  userId: string;
} & TUpdateUserInput;

export type TUpdateUserResult = TUser;

export const useUpdateUser = (options?: TMutationOpts<TUpdateUserArgs, TUpdateUserResult>) => {
  return useMutation({
    mutationKey: ["useUpdateUser"],
    mutationFn: (args: TUpdateUserArgs) => {
      const { userId, ...payload } = args;
      return api.put(`/users/${userId}`, payload) as TApiPromise<TUpdateUserResult>;
    },
    ...options,
    onSuccess: (...data) => {
      queryClient.invalidateQueries({ queryKey: ["useGetUser"] });
      queryClient.invalidateQueries({ queryKey: ["useGetAllUsers"] });
      queryClient.invalidateQueries({ queryKey: ["useGetMe"] });
      options?.onSuccess?.(...data);
    },
  });
};

export type TDeleteUserArgs = {
  userId: string;
};

export const useDeleteUser = (options?: TMutationOpts<TDeleteUserArgs>) => {
  return useMutation({
    mutationKey: ["useDeleteUser"],
    mutationFn: (args: TDeleteUserArgs) => {
      return api.delete(`/users/${args.userId}`) as TApiPromise<void>;
    },
    ...options,
    onSuccess: (...data) => {
      queryClient.invalidateQueries({ queryKey: ["useGetAllUsers"] });
      options?.onSuccess?.(...data);
    },
  });
};
