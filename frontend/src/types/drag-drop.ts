// Drag & Drop Types
export interface DragItem {
  id: string
  type: string
  data: any
}

export interface DropZone {
  id: string
  accepts: string[]
  position: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface DragState {
  isDragging: boolean
  draggedItem: DragItem | null
  dropZone: DropZone | null
  preview: React.ReactNode | null
}

export interface DragHandlers {
  onDragStart: (item: DragItem) => void
  onDragEnd: () => void
  onDragOver: (zone: DropZone) => void
  onDrop: (item: DragItem, zone: DropZone) => void
}

// Element drag & drop
export interface ElementDragItem extends DragItem {
  type: 'element'
  elementType: string
  elementData: any
}

export interface ElementDropZone extends DropZone {
  accepts: string[]
  parentId?: string
  index?: number
}

// Template drag & drop
export interface TemplateDragItem extends DragItem {
  type: 'template'
  templateId: string
  templateData: any
}

// Media drag & drop
export interface MediaDragItem extends DragItem {
  type: 'media'
  mediaId: string
  mediaUrl: string
  mediaType: 'image' | 'video' | 'document'
}

// Drag & Drop Events
export interface DragStartEvent {
  item: DragItem
  source: {
    id: string
    index: number
  }
}

export interface DragEndEvent {
  item: DragItem
  source: {
    id: string
    index: number
  }
  destination?: {
    id: string
    index: number
  }
}

export interface DragOverEvent {
  item: DragItem
  over: DropZone
}

export interface DropEvent {
  item: DragItem
  zone: DropZone
  position: {
    x: number
    y: number
  }
}
