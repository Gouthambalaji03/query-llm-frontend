export interface ModelOption {
  value: string; // provider:model format
  label: string; // Display name
  provider: 'openai' | 'anthropic' | 'gemini';
  description?: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  // OpenAI – GPT-5 chat only
  // {
  //   value: 'openai:gpt-5',
  //   label: 'GPT-5',
  //   provider: 'openai',
  //   description: 'Chat model'
  // },
  // {
  //   value: 'openai:gpt-5-mini',
  //   label: 'GPT-5 Mini',
  //   provider: 'openai',
  //   description: 'Compact chat model'
  // },

  // Google – Gemini 2
  {
    value: 'gemini:gemini-2.5-flash',
    label: 'Gemini 2.5 Flash',
    provider: 'gemini',
    description: 'Fast and versatile'
  },
  {
    value: 'gemini:gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
    provider: 'gemini',
    description: 'Most capable'
  },
  {
    value: 'gemini:gemini-2.0-flash',
    label: 'Gemini 2.0 Flash',
    provider: 'gemini',
    description: 'Multimodal, general tasks'
  },
];

export const DEFAULT_MODEL = 'gemini:gemini-2.5-flash';

export const getModelLabel = (value: string): string => {
  const model = AVAILABLE_MODELS.find(m => m.value === value);
  return model?.label || value;
};
