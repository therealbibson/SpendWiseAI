import React from 'react'
import { BrowserRouter, Router, Routes, Route } from 'react-router-dom'

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<div>Hello, World!</div>} />
        </Routes>
      </BrowserRouter>

    </div>
  )
}

export default App
