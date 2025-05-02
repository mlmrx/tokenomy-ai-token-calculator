
// Define color themes for each model provider/company
export const modelThemes = {
  'OpenAI': {
    primary: '#10a37f', // OpenAI green
    secondary: '#0c8b6c',
    accent: '#e7f9f5',
    border: '#a3e0d0',
    chart: {
      input: 'rgba(16, 163, 127, 0.6)',
      inputBorder: 'rgba(16, 163, 127, 1)',
      output: 'rgba(10, 110, 85, 0.6)',
      outputBorder: 'rgba(10, 110, 85, 1)'
    }
  },
  'Anthropic': {
    primary: '#b83280', // Anthropic pink/purple
    secondary: '#9c2670',
    accent: '#fbe9f5',
    border: '#eaadcf',
    chart: {
      input: 'rgba(184, 50, 128, 0.6)',
      inputBorder: 'rgba(184, 50, 128, 1)',
      output: 'rgba(142, 44, 102, 0.6)',
      outputBorder: 'rgba(142, 44, 102, 1)'
    }
  },
  'Meta': {
    primary: '#1877f2', // Meta blue
    secondary: '#0d6efd',
    accent: '#e6f1ff',
    border: '#afd0ff',
    chart: {
      input: 'rgba(24, 119, 242, 0.6)',
      inputBorder: 'rgba(24, 119, 242, 1)',
      output: 'rgba(14, 87, 179, 0.6)',
      outputBorder: 'rgba(14, 87, 179, 1)'
    }
  },
  'Google': {
    primary: '#4285f4', // Google blue
    secondary: '#34a853', // Google green
    accent: '#edf4ff',
    border: '#b0d1ff',
    chart: {
      input: 'rgba(66, 133, 244, 0.6)',
      inputBorder: 'rgba(66, 133, 244, 1)',
      output: 'rgba(52, 168, 83, 0.6)',
      outputBorder: 'rgba(52, 168, 83, 1)'
    }
  },
  'Microsoft': {
    primary: '#00a4ef', // Microsoft blue
    secondary: '#7fba00', // Microsoft green
    accent: '#e8f7ff',
    border: '#b3e0ff',
    chart: {
      input: 'rgba(0, 164, 239, 0.6)',
      inputBorder: 'rgba(0, 164, 239, 1)',
      output: 'rgba(127, 186, 0, 0.6)',
      outputBorder: 'rgba(127, 186, 0, 1)'
    }
  },
  'Amazon': {
    primary: '#ff9900', // Amazon orange
    secondary: '#146eb4', // Amazon blue
    accent: '#fff8e6',
    border: '#ffdeaa',
    chart: {
      input: 'rgba(255, 153, 0, 0.6)',
      inputBorder: 'rgba(255, 153, 0, 1)',
      output: 'rgba(20, 110, 180, 0.6)',
      outputBorder: 'rgba(20, 110, 180, 1)'
    }
  },
  'Mistral': {
    primary: '#7928ca', // Mistral purple
    secondary: '#6021a8',
    accent: '#f3eaff',
    border: '#d0b4f5',
    chart: {
      input: 'rgba(121, 40, 202, 0.6)',
      inputBorder: 'rgba(121, 40, 202, 1)',
      output: 'rgba(96, 33, 168, 0.6)',
      outputBorder: 'rgba(96, 33, 168, 1)'
    }
  },
  'default': {
    primary: '#8b5cf6', // Default purple from the original theme
    secondary: '#7c3aed',
    accent: '#f5f0ff',
    border: '#d8c2ff',
    chart: {
      input: 'rgba(139, 92, 246, 0.6)',
      inputBorder: 'rgba(139, 92, 246, 1)',
      output: 'rgba(124, 58, 237, 0.6)',
      outputBorder: 'rgba(124, 58, 237, 1)'
    }
  }
};

// Helper function to get the company from model name
export function getCompanyFromModel(model: string): string {
  if (model.includes('gpt') || model.includes('openai')) return 'OpenAI';
  if (model.includes('claude')) return 'Anthropic';
  if (model.includes('llama')) return 'Meta';
  if (model.includes('gemini')) return 'Google';
  if (model.includes('phi') || model.includes('azure')) return 'Microsoft';
  if (model.includes('titan')) return 'Amazon';
  if (model.includes('mistral')) return 'Mistral';
  return 'default';
}

// Get the theme for a specific model
export function getModelTheme(model: string) {
  const company = getCompanyFromModel(model);
  return modelThemes[company] || modelThemes.default;
}

// Get analysis chart colors - different from model comparison colors
export const analysisChartColors = {
  tokens: {
    bg: 'rgba(121, 40, 202, 0.5)',
    border: 'rgba(121, 40, 202, 1)'
  },
  chars: {
    bg: 'rgba(59, 130, 246, 0.5)',
    border: 'rgba(59, 130, 246, 1)'
  },
  inputCost: {
    bg: 'rgba(16, 185, 129, 0.5)',
    border: 'rgba(16, 185, 129, 1)'
  },
  outputCost: {
    bg: 'rgba(245, 158, 11, 0.5)',
    border: 'rgba(245, 158, 11, 1)'
  }
};
