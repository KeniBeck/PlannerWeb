import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './views/Home'
import Login from './views/Login'
import Workers from './views/Dashboard/workers/Workers'


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path='/workers' element={<Workers></Workers>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App