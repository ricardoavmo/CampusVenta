import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Ficha from './pages/Ficha';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/emprendimiento/:id" element={<Ficha />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
