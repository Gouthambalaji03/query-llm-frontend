export interface ModelOption {
  value: string; // provider:model format
  label: string; // Display name
  provider: 'openai' | 'anthropic' | 'gemini';
  description?: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  // OpenAI models
  {
    value: 'openai:gpt-4o',
    label: 'GPT-4o',
    provider: 'openai',
    description: 'Most capable OpenAI model'
  },
  {
    value: 'openai:gpt-4o-mini',
    label: 'GPT-4o Mini',
    provider: 'openai',
    description: 'Fast and efficient'
  },
  {
    value: 'openai:o1',
    label: 'o1',
    provider: 'openai',
    description: 'Reasoning model'
  },
  {
    value: 'openai:o1-mini',
    label: 'o1 Mini',
    provider: 'openai',
    description: 'Compact reasoning model'
  },

  // Anthropic models
  {
    value: 'anthropic:claude-sonnet-4.5',
    label: 'Claude Sonnet 4.5',
    provider: 'anthropic',
    description: 'Balanced performance'
  },
  {
    value: 'anthropic:claude-opus-4.6',
    label: 'Claude Opus 4.6',
    provider: 'anthropic',
    description: 'Most capable Claude'
  },
  {
    value: 'anthropic:claude-haiku-4.5',
    label: 'Claude Haiku 4.5',
    provider: 'anthropic',
    description: 'Fast responses'
  },

  // Google models
  {
    value: 'gemini:gemini-2.5-flash',
    label: 'Gemini 2.5 Flash',
    provider: 'gemini',
    description: 'Latest stable - Fast and versatile'
  },
  {
    value: 'gemini:gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
    provider: 'gemini',
    description: 'Latest stable - Most capable'
  },
  {
    value: 'gemini:gemini-3-flash-preview',
    label: 'Gemini 3 Flash Preview',
    provider: 'gemini',
    description: 'Next-gen preview model'
  },
];

export const DEFAULT_MODEL = 'anthropic:claude-sonnet-4.5';

export const getModelLabel = (value: string): string => {
  const model = AVAILABLE_MODELS.find(m => m.value === value);
  return model?.label || value;
};
