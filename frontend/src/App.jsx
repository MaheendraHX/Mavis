import { useState } from 'react'
import Boot from './components/Boot'
import Landing from './components/Landing'
import SignIn from './components/SignIn'
import Chat from './components/Chat'

export default function App() {
  const [screen, setScreen] = useState('boot')

  return (
    <div style={{ width: '100vw', minHeight: '100vh', background: '#050506' }}>
      {screen === 'boot' && <Boot onComplete={() => setScreen('landing')} />}
      {screen === 'landing' && <Landing onEnter={() => setScreen('signin')} />}
      {screen === 'signin' && (
        <SignIn
          onSuccess={() => {
            setScreen('chat')
          }}
        />
      )}
      {screen === 'chat' && <Chat userType="guest" />}
    </div>
  )
}