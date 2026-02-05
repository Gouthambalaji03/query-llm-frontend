import { User as FirebaseUser } from "firebase/auth";

export type User = FirebaseUser;

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export interface TUser {
  id: string;
  name: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

export interface TCreateUserInput {
  name: string;
  email: string;
}

export interface TUpdateUserInput {
  name?: string;
  email?: string;
}

export interface TPaginationParams {
  page?: number;
  limit?: number;
}

export interface TPaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface TConversation {
  id: string;
  user_id: string;
  conversation_id: string;
  title: string;
  ai_model: string;
  status: "active" | "archived";
  deleted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface TCreateConversationInput {
  conversation_id: string;
  title: string;
  model: string;
  initial_message?: string;
}

export interface TUpdateConversationInput {
  title?: string;
  model?: string;
  status?: "active" | "archived";
  message?: TMessageInput;
}

export interface TTextPart {
  type: "text";
  text: string;
}

export interface TToolInvocationPart {
  type: "tool-invocation";
  toolCallId: string;
  toolName: string;
  state: "call" | "result" | "partial-call";
  args?: unknown;
  result?: unknown;
}

export interface TMessageInput {
  id?: string;
  role: "user" | "assistant";
  content: string;
  parts?: Array<TTextPart | TToolInvocationPart>;
}

export interface TUserMessage {
  id: string;
  role: "user";
  content: string;
  created_at: Date;
}

export interface TAssistantMessage {
  id: string;
  role: "assistant";
  content: string;
  parts?: Array<TTextPart | TToolInvocationPart>;
  created_at: Date;
}

export type TMessage = TUserMessage | TAssistantMessage;

export interface TConversationWithMessages extends TConversation {
  messages: TMessage[];
}

export interface TApiSuccessResponse<T> {
  success: true;
  data?: T;
  message?: string;
}

export interface TApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type TApiResponse<T> = TApiSuccessResponse<T> | TApiErrorResponse;

export type TAiStreamEvent =
  | { type: "chat-start"; conversationId: string; messageId: string; model: string }
  | { type: "message-start"; messageId: string; role: "user" | "assistant" | "system" | "tool" }
  | { type: "text"; messageId: string; delta: string; isFinal?: boolean }
  | {
      type: "tool-invocation";
      toolCallId: string;
      toolName: string;
      state: "call" | "result" | "partial-call";
      args?: unknown;
      result?: unknown;
    }
  | { type: "tool-result"; toolCallId: string; toolName: string; result: unknown }
  | { type: "usage"; promptTokens: number; completionTokens: number; totalTokens: number }
  | { type: "chat-name"; title: string }
  | { type: "chat-complete"; messageId: string; finishReason?: string }
  | { type: "error"; code: string; message: string; details?: unknown }
  | { type: "ping"; ts: number }
  | { type: "cancel"; reason?: string };
