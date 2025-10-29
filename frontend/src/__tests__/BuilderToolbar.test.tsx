import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import BuilderToolbar from '../components/layouts/BuilderToolbar'

describe('BuilderToolbar', () => {
  it('calls handlers on click', () => {
    const onUndo = jest.fn()
    const onRedo = jest.fn()
    const onSave = jest.fn()
    const onPreview = jest.fn()
    const onPublish = jest.fn()

    render(
      <BuilderToolbar
        selectedElement={null}
        onUndo={onUndo}
        onRedo={onRedo}
        onSave={onSave}
        onPreview={onPreview}
        onPublish={onPublish}
      />
    )

    fireEvent.click(screen.getByTitle('Undo (Ctrl+Z)'))
    fireEvent.click(screen.getByTitle('Redo (Ctrl+Shift+Z)'))
    fireEvent.click(screen.getByText('💾 Save Draft'))
    fireEvent.click(screen.getByText('👁️ Preview'))
    fireEvent.click(screen.getByText('🚀 Publish'))

    expect(onUndo).toHaveBeenCalled()
    expect(onRedo).toHaveBeenCalled()
    expect(onSave).toHaveBeenCalled()
    expect(onPreview).toHaveBeenCalled()
    expect(onPublish).toHaveBeenCalled()
  })
})


