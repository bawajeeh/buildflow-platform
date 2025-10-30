// Data Binding Utilities for Phase 3

export interface DataContext {
  products?: any[];
  blog?: any[];
  services?: any[];
  custom?: any[];
  currentItem?: any; // For loops
  [key: string]: any;
}

/**
 * Resolve data binding expressions like {{product.name}} or {{item.price}}
 */
export function resolveDataBinding(
  template: string,
  context: DataContext
): string {
  if (!template || typeof template !== 'string') return template

  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const keys = path.trim().split('.')
    let value: any = context

    for (const key of keys) {
      if (value === null || value === undefined) return match
      // Handle array access like products[0]
      if (key.includes('[')) {
        const [arrayKey, index] = key.split('[')
        const idx = parseInt(index.replace(']', ''))
        value = value[arrayKey]?.[idx]
      } else {
        value = value[key]
      }
    }

    return value !== null && value !== undefined ? String(value) : match
  })
}

/**
 * Check if conditional rule passes
 */
export function evaluateCondition(
  condition: { field: string; operator: string; value: any },
  context: DataContext
): boolean {
  const { field, operator, value } = condition
  const keys = field.split('.')
  let dataValue: any = context

  for (const key of keys) {
    if (dataValue === null || dataValue === undefined) return false
    dataValue = dataValue[key]
  }

  switch (operator) {
    case 'eq':
      return dataValue === value
    case 'ne':
      return dataValue !== value
    case 'gt':
      return Number(dataValue) > Number(value)
    case 'gte':
      return Number(dataValue) >= Number(value)
    case 'lt':
      return Number(dataValue) < Number(value)
    case 'lte':
      return Number(dataValue) <= Number(value)
    case 'contains':
      return String(dataValue).includes(String(value))
    case 'exists':
      return dataValue !== null && dataValue !== undefined
    default:
      return true
  }
}

/**
 * Apply animations to element
 */
export function getAnimationClasses(config: {
  entrance?: string;
  exit?: string;
  delay?: number;
}): string {
  const classes: string[] = []

  if (config.entrance && config.entrance !== 'none') {
    // Map animation types to CSS classes
    const animMap: Record<string, string> = {
      fade: 'animate-fade',
      slide: 'animate-slide',
      zoom: 'animate-zoom',
      bounce: 'animate-bounce',
    }
    const className = animMap[config.entrance] || `animate-${config.entrance}`
    classes.push(className)
  }

  if (config.delay) {
    classes.push(`delay-${config.delay}`)
  }

  return classes.join(' ')
}

