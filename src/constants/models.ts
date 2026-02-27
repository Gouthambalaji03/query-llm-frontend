export interface ModelOption {
  value: string; // provider:model format
  label: string; // Display name
  provider: 'openai' | 'anthropic' | 'gemini';
  description?: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  // OpenAI – GPT-5 chat only
  {
    value: 'openai:gpt-5',
    label: 'GPT-5',
    provider: 'openai',
    description: 'Chat model'
  },
  {
    value: 'openai:gpt-5-mini',
    label: 'GPT-5 Mini',
    provider: 'openai',
    description: 'Compact chat model'
  },

  // Google – Gemini 3 only
  {
    value: 'gemini:gemini-3-flash-preview',
    label: 'Gemini 3 Flash Preview',
    provider: 'gemini',
    description: 'Next-gen preview'
  },
  {
    value: 'gemini:gemini-3.1-pro-preview',
    label: 'Gemini 3.1 Pro Preview',
    provider: 'gemini',
    description: 'Advanced reasoning preview'
  },
];

export const DEFAULT_MODEL = 'openai:gpt-5';

export const getModelLabel = (value: string): string => {
  const model = AVAILABLE_MODELS.find(m => m.value === value);
  return model?.label || value;
};
