import create from 'zustand'

interface ModalState {
  isOpen: boolean
  content: string | null
  open: (content: string) => void
  close: () => void
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  content: null,
  open: (content: string) => set({ isOpen: true, content }),
  close: () => set({ isOpen: false, content: null }),
}))


