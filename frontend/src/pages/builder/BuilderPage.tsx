import React from 'react'
import BuilderCanvas from '@/components/builder/BuilderCanvas'
import ElementRenderer from '@/components/builder/ElementRenderer'

const BuilderPage: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex">
        <div className="flex-1">
          <BuilderCanvas />
        </div>
        <div className="w-80 bg-white border-l border-gray-200 p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Properties</h3>
          <p className="text-gray-500">Select an element to edit its properties</p>
        </div>
      </div>
    </div>
  )
}

export default BuilderPage
