import { Link } from 'react-router-dom'

export default function Navbar() {
    return (
        <nav className="bg-linear-to-b from-accent to-transparent p-8 text-white flex justify-between items-start h-30">
            <h1 className="text-4xl">ΛΦΕ</h1>
            <ul className="flex space-x-8 text-xl">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/chapter-timeline">Chapter Timeline</Link></li>
                <li><Link to="/family-tree">Family Tree</Link></li>
                <li><Link to="/rush">Rush</Link></li>
                <li><Link to="/merch">Merch</Link></li>
            </ul>
        </nav>
    )
}