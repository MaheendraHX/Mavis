import { useState } from 'react'
import Boot from './components/Boot'
import Landing from './components/Landing'
import SignIn from './components/SignIn'
import Chat from './components/Chat'

export default function App() {
  const [screen, setScreen] = useState('boot')

  return (
    <div style={{ width: '100vw', minHeight: '100vh', background: '#382B27' }}>
      {screen === 'boot' && <Boot onComplete={() => setScreen('landing')} />}
      {screen === 'landing' && (
        <Landing
          onEnter={(target) => {
            if (target === 'chat') setScreen('chat')
            else setScreen('signin')
          }}
        />
      )}
      {screen === 'signin' && (
        <SignIn
          onEnter={(target) => {
            if (target === 'landing') setScreen('landing')
            else setScreen('chat')
          }}
        />
      )}
      {screen === 'chat' && (
        <Chat
          userType="guest"
          onNavigate={(target) => {
            if (target === 'home') setScreen('landing')
            else if (target === 'signin') setScreen('signin')
          }}
        />
      )}
    </div>
  )
}
