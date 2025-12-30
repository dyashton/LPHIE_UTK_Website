import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Layout from './components/Layout'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import ChapterTimeline from './pages/ChapterTimeline.jsx'
import FamilyTree from './pages/FamilyTree.jsx'
import Rush from './pages/Rush.jsx'
import Merch from './pages/Merch.jsx'
import Brothers from './pages/Brothers.jsx'

function App() {

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/chapter-timeline" element={<ChapterTimeline />} />
        <Route path="/family-tree" element={<FamilyTree />} />
        <Route path="/rush" element={<Rush />} />
        <Route path="/merch" element={<Merch />} />
        <Route path="/brothers" element={<Brothers />} />
      </Routes>
    </Layout>
  )
}

export default App
