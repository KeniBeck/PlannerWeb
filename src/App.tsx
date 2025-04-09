import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './views/Home'
import Login from './views/Login'


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App