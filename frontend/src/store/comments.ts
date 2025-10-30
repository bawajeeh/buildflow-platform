import { create } from 'zustand'

export interface CommentItem {
  id: string
  pageId: string
  elementId?: string | null
  author?: string
  text: string
  createdAt: string
  resolved: boolean
}

interface CommentsState {
  commentsByPage: Record<string, CommentItem[]>
  addComment: (pageId: string, payload: { elementId?: string | null; text: string; author?: string }) => void
  resolveComment: (pageId: string, id: string) => void
  deleteComment: (pageId: string, id: string) => void
  list: (pageId: string) => CommentItem[]
}

export const useCommentsStore = create<CommentsState>((set, get) => ({
  commentsByPage: {},

  addComment: (pageId, payload) => {
    const next: CommentItem = {
      id: `c_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      pageId,
      elementId: payload.elementId || null,
      author: payload.author || 'You',
      text: payload.text,
      createdAt: new Date().toISOString(),
      resolved: false,
    }
    set((state) => ({
      commentsByPage: {
        ...state.commentsByPage,
        [pageId]: [...(state.commentsByPage[pageId] || []), next],
      },
    }))
  },

  resolveComment: (pageId, id) => {
    set((state) => ({
      commentsByPage: {
        ...state.commentsByPage,
        [pageId]: (state.commentsByPage[pageId] || []).map((c) => (c.id === id ? { ...c, resolved: true } : c)),
      },
    }))
  },

  deleteComment: (pageId, id) => {
    set((state) => ({
      commentsByPage: {
        ...state.commentsByPage,
        [pageId]: (state.commentsByPage[pageId] || []).filter((c) => c.id !== id),
      },
    }))
  },

  list: (pageId) => {
    const { commentsByPage } = get()
    return commentsByPage[pageId] || []
  },
}))


