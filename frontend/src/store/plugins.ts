import { create } from 'zustand'

export interface PluginDefinition {
  type: string // e.g. 'chart.bar'
  render: (props: Record<string, any>) => JSX.Element
}

interface PluginsState {
  registry: Record<string, PluginDefinition>
  register: (def: PluginDefinition) => void
  get: (type: string) => PluginDefinition | undefined
}

export const usePluginsStore = create<PluginsState>((set, get) => ({
  registry: {},
  register: (def) => set((s) => ({ registry: { ...s.registry, [def.type.toLowerCase()]: def } })),
  get: (type) => get().registry[type.toLowerCase()],
}))


