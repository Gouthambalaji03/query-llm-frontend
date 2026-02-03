import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/tanstack-query";
import type { TUser, TCreateUserInput } from "@/types";
import type { TApiPromise, TMutationOpts, TQueryOpts } from "@/types/tanstack-query";

export type TLoginArgs = {
  name?: string;
};

export type TLoginResult = TUser;

export const useLogin = (options?: TMutationOpts<TLoginArgs, TLoginResult>) => {
  return useMutation({
    mutationKey: ["useLogin"],
    mutationFn: (args: TLoginArgs) => {
      // Login endpoint uses Firebase token from Authorization header (added by api interceptor)
      // Optional name is sent in body for new user registration
      return api.post("/auth/login", args) as TApiPromise<TLoginResult>;
    },
    ...options,
    onSuccess: (...data) => {
      queryClient.invalidateQueries({ queryKey: ["useGetMe"] });
      options?.onSuccess?.(...data);
    },
  });
};

export type TGetMeResult = TUser;

export const useGetMe = (options?: TQueryOpts<TGetMeResult>) => {
  return useQuery({
    queryKey: ["useGetMe"],
    queryFn: () => {
      return api.get("/auth/me") as TApiPromise<TGetMeResult>;
    },
    select: (response) => response.data.data,
    ...options,
  });
};

export const useCreateUser = (options?: TMutationOpts<TCreateUserInput, TUser>) => {
  return useMutation({
    mutationKey: ["useCreateUser"],
    mutationFn: (args: TCreateUserInput) => {
      return api.post("/users/", args) as TApiPromise<TUser>;
    },
    ...options,
    onSuccess: (...data) => {
      queryClient.invalidateQueries({ queryKey: ["useGetMe"] });
      options?.onSuccess?.(...data);
    },
  });
};
