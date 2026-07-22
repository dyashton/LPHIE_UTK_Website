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
import Gallery from './pages/Gallery.jsx'
import Philanthropy from './pages/Philanthropy.jsx'
import AdminData from './pages/AdminData.jsx'

function App() {

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="chapter-timeline" element={<ChapterTimeline />} />
        <Route path="family-tree" element={<FamilyTree />} />
        <Route path="rush" element={<Rush />} />
        <Route path="merch" element={<Merch />} />
        <Route path="brothers" element={<Brothers />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="philanthropy" element={<Philanthropy />} />
        <Route path="admin/data" element={<AdminData />} />
      </Routes>
    </Layout>
  )
}

export default App
