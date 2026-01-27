import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/tanstack-query";
import type {
  TConversation,
  TMessage,
  TCreateConversationInput,
  TUpdateConversationInput,
  TPaginationParams,
} from "@/types";
import type { TApiPromise, TMutationOpts, TQueryOpts } from "@/types/tanstack-query";

export type TGetAllConversationsArgs = TPaginationParams & {
  status?: "active" | "archived" | "all";
};

export type TGetAllConversationsResult = {
  conversations: TConversation[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
};

export const useGetAllConversations = (
  args: TGetAllConversationsArgs = {},
  options?: TQueryOpts<TGetAllConversationsResult>
) => {
  return useQuery({
    queryKey: ["useGetAllConversations", args],
    queryFn: () => {
      return api.get("/conversations/", {
        params: args,
      }) as TApiPromise<TGetAllConversationsResult>;
    },
    select: (response) => response.data.data,
    ...options,
  });
};

export type TGetConversationArgs = {
  conversationId: string;
};

export type TGetConversationResult = {
  conversation: TConversation;
  user_context_messages: TMessage[];
  agent_context_messages: unknown[];
};

export const useGetConversation = (
  args: TGetConversationArgs,
  options?: TQueryOpts<TGetConversationResult>
) => {
  return useQuery({
    queryKey: ["useGetConversation", args],
    queryFn: () => {
      return api.get(`/conversations/${args.conversationId}`) as TApiPromise<TGetConversationResult>;
    },
    select: (response) => response.data.data,
    enabled: !!args.conversationId,
    ...options,
  });
};

export type TCreateConversationArgs = TCreateConversationInput;

export type TCreateConversationResult = TConversation;

export const useCreateConversation = (
  options?: TMutationOpts<TCreateConversationArgs, TCreateConversationResult>
) => {
  return useMutation({
    mutationKey: ["useCreateConversation"],
    mutationFn: (args: TCreateConversationArgs) => {
      return api.post("/conversations/", args) as TApiPromise<TCreateConversationResult>;
    },
    ...options,
    onSuccess: (...data) => {
      queryClient.invalidateQueries({ queryKey: ["useGetAllConversations"] });
      options?.onSuccess?.(...data);
    },
  });
};

export type TUpdateConversationArgs = {
  conversationId: string;
} & TUpdateConversationInput;

export type TUpdateConversationResult = TConversation;

export const useUpdateConversation = (
  options?: TMutationOpts<TUpdateConversationArgs, TUpdateConversationResult>
) => {
  return useMutation({
    mutationKey: ["useUpdateConversation"],
    mutationFn: (args: TUpdateConversationArgs) => {
      const { conversationId, ...payload } = args;
      return api.patch(`/conversations/${conversationId}`, payload) as TApiPromise<TUpdateConversationResult>;
    },
    ...options,
    onSuccess: (...data) => {
      queryClient.invalidateQueries({ queryKey: ["useGetConversation"] });
      queryClient.invalidateQueries({ queryKey: ["useGetAllConversations"] });
      options?.onSuccess?.(...data);
    },
  });
};

export type TDeleteConversationArgs = {
  conversationId: string;
};

export const useDeleteConversation = (options?: TMutationOpts<TDeleteConversationArgs>) => {
  return useMutation({
    mutationKey: ["useDeleteConversation"],
    mutationFn: (args: TDeleteConversationArgs) => {
      return api.delete(`/conversations/${args.conversationId}`) as TApiPromise<void>;
    },
    ...options,
    onSuccess: (...data) => {
      queryClient.invalidateQueries({ queryKey: ["useGetAllConversations"] });
      options?.onSuccess?.(...data);
    },
  });
};
