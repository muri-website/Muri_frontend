import React from 'react'

const NotFound: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-neutral-900 text-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-green-500 mb-4">404</h1>
        <p className="text-xl mb-8">Az oldal nem található.</p>
        <a href="/login" className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
          Vissza a bejelentkezéshez
        </a>
      </div>
    </div>
  )
}

export default NotFound