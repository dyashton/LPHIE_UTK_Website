import { Link } from 'react-router-dom'
import { ChevronUp } from 'lucide-react'

const dropdownItems = [
    { name: 'Brothers', path: '/brothers' },
    { name: 'Chapter Timeline', path: '/chapter-timeline' },
    { name: 'Family Tree', path: '/family-tree' },
    { name: 'About Us', path: '/about' },
]

export default function Navbar() {
    return (
        <nav className="bg-linear-to-b from-accent to-transparent p-8 px-12 text-white flex justify-between items-start h-30">
            <Link to="/"><h1 className="text-5xl font-cinzel">ΛΦΕ</h1></Link>
            <ul className="flex space-x-12 text-2xl">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/rush">Rush</Link></li>
                <li className="flex flex-col justify-center items-start gap-2 group relative">
                    <div className="flex flex-row justify-center items-center gap-2">
                        <ChevronUp className="chevron-icon group-hover:rotate-180 transition-transform duration-300" />
                        <p>UTK Chapter</p>
                    </div>
                    <div className="absolute top-full left-0 w-fit h-fit p-4 bg-primary border-accent border-2 rounded-md hidden group-hover:block">
                        <ul className="flex flex-col space-y-2 ">
                            {dropdownItems.map((item) => (
                                <li key={item.name}>
                                    <Link to={item.path} className="text-lg whitespace-nowrap">{item.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </li>
                <li><Link to="/merch">Merch</Link></li>
                <li><Link to="/contact">Contact</Link></li>
            </ul>
        </nav>
    )
}