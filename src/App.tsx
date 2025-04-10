import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './views/Home'
import Login from './views/Login'
import { ProtectedRoute } from './middleware/ProtectedRoute'
import Forbidden from './views/Foorbiden'


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
          <Home/>
          </ProtectedRoute>} />
        <Route path="/login" element={<Login/>} />
        <Route path='/forbidden' element={<Forbidden/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App