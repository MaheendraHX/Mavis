import { useState } from 'react'
import Boot from './components/Boot'
import Landing from './components/Landing'
import Chat from './components/Chat'

export default function App() {
  const [screen, setScreen] = useState('boot')

  return (
    <div style={{ width: '100vw', minHeight: '100vh', background: '#faf9f7' }}>
      {screen === 'boot' && <Boot onComplete={() => setScreen('landing')} />}
      {screen === 'landing' && (
        <Landing onNavigate={setScreen} />
      )}
      {screen === 'chat' && (
        <Chat onNavigate={setScreen} />
      )}
    </div>
  )
}
