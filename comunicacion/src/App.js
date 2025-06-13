import './App.css';
import Home from './Componentes/Home';
import React from 'react';
import ImagenesProcesadas from './Componentes/ImagenesProcesadas';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/imagenes-procesadas" element={<ImagenesProcesadas/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
