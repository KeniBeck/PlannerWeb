import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './views/Home'
import Login from './views/Login'
import { ProtectedRoute } from './middleware/ProtectedRoute'
import Forbidden from './views/Foorbiden'
import Dashboard from './views/Dashboard'



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
        <Route path='/dashboard/*' element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App