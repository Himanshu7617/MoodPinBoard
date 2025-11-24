import {Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import CreateBoardPage from './pages/CreateBoardPage'
import BoardManagerPage from './pages/BoardManagerPage'
const App = () => {
    return (
        <div className='overflow-hidden'>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/create-board" element={<CreateBoardPage />} />
                <Route path="/board-manager" element={<BoardManagerPage />} />
            </Routes>
        </div>
    )
}   

export default App
