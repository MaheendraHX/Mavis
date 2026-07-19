import { useState } from 'react'
import { ThemeProvider } from './components/chat-features/ThemeContext'
import Boot from './components/Boot'
import Landing from './components/Landing'
import SignIn from './components/SignIn'
import Chat from './components/Chat'

export default function App() {
  const [screen, setScreen] = useState('boot')

  const handleOwnerAccess = (sessionId) => {
    localStorage.setItem('mavis_owner_session', sessionId)
    setScreen('chat')
  }

  const handleDemoAccess = () => {
    setScreen('chat')
  }

  return (
    <ThemeProvider>
      <div style={{ width: '100vw', minHeight: '100vh' }}>
        {screen === 'boot' && <Boot onComplete={() => setScreen('landing')} />}
        {screen === 'landing' && (
          <Landing onEnter={setScreen} />
        )}
        {screen === 'signin' && (
          <SignIn onOwnerAccess={handleOwnerAccess} onDemoAccess={handleDemoAccess} />
        )}
        {screen === 'chat' && (
          <Chat onNavigate={setScreen} />
        )}
      </div>
    </ThemeProvider>
  )
}
