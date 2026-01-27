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
  firebase_uid: string;
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
  data: T;
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
