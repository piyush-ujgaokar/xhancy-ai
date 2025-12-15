import React from 'react'

export default function Home() {
  const handleLogout = () => {
    // placeholder for logout logic
    console.log('Logout clicked')
  }

  return (
    <div style={{ maxWidth: 760, margin: '48px auto', padding: 24 }}>
      <h1>Welcome</h1>
      <p>This is the home page. Replace with your app content.</p>
      <button onClick={handleLogout} style={{ padding: '8px 16px' }}>
        Logout
      </button>
    </div>
  )
}
