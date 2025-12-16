import React from 'react'

export default function Home() {
  const handleLogout = () => {
    // placeholder for logout logic
    console.log('Logout clicked')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100 p-6">
      <div className="w-full bg-gray-800/60 backdrop-blur rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-semibold mb-4">Welcome</h1>
        <p className="text-gray-300 mb-6">This is the home page. Replace with your app content.</p>
      </div>
    </div>
  )
}
