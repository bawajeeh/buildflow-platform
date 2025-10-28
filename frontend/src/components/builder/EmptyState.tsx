import React from 'react'

const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center p-8">
      {/* Animated Icon */}
      <div className="relative mb-8">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform">
          <div className="text-6xl animate-bounce">🚀</div>
        </div>
        <div className="absolute -top-3 -right-3 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
          <span className="text-2xl">✨</span>
        </div>
        <div className="absolute -bottom-2 -left-4 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
          <span className="text-lg">⭐</span>
        </div>
      </div>
      
      {/* Title with Gradient */}
      <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
        Start Building Your Website
      </h3>
      
      {/* Description */}
      <p className="text-gray-600 max-w-lg text-lg mb-8 leading-relaxed">
        Drag elements from the sidebar to create amazing pages. 
        <br className="hidden sm:block" />
        Build stunning websites in minutes!
      </p>
      
      {/* Quick Info Cards */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
        <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
          <span className="text-xl">📝</span>
          <span className="text-blue-700 font-medium">Text Blocks</span>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-full">
          <span className="text-xl">🖼️</span>
          <span className="text-purple-700 font-medium">Images</span>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-pink-50 border border-pink-200 rounded-full">
          <span className="text-xl">🔘</span>
          <span className="text-pink-700 font-medium">Buttons</span>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
          <span className="text-xl">📦</span>
          <span className="text-green-700 font-medium">Sections</span>
        </div>
      </div>

      {/* Hint */}
      <div className="mt-8 px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-gray-600">
          💡 <span className="font-medium">Tip:</span> Start with a Section or Container, then add content inside
        </p>
      </div>
    </div>
  )
}

export default EmptyState