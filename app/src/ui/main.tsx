import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { HashRouter } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './context/AuthContext.tsx'
import { BoardProvider } from './context/BoardContext.tsx'

createRoot(document.getElementById('root')!).render(
    <HashRouter>
        <AuthProvider>
            <BoardProvider>
                <App />
            </BoardProvider>
        </AuthProvider>
    </HashRouter>
)
