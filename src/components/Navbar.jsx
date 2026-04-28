import { Link } from 'react-router-dom'
import { ChevronUp, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const dropdownItems = [
    { name: 'Brothers', path: '/brothers' },
    { name: 'Chapter Timeline', path: '/chapter-timeline' },
    { name: 'Family Tree', path: '/family-tree' },
    { name: 'About Us', path: '/about' },
]

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false)

    useEffect(() => {
        function onKeyDown(e) {
            if (e.key === 'Escape') setMobileOpen(false)
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [])

    return (
        <nav className="bg-linear-to-b from-accent to-transparent text-white flex items-start justify-between px-4 py-4 sm:px-8 sm:py-6">
            <Link to="/" onClick={() => setMobileOpen(false)}>
                <h1 className="text-3xl sm:text-5xl font-cinzel leading-none">ΛΦΕ</h1>
            </Link>

            {/* Desktop nav */}
            <ul className="hidden md:flex items-center gap-8 lg:gap-12 text-lg lg:text-2xl">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/rush">Rush</Link></li>
                <li className="flex flex-col justify-center items-start gap-2 group relative">
                    <div className="flex flex-row justify-center items-center gap-2 cursor-pointer select-none">
                        <ChevronUp className="chevron-icon group-hover:rotate-180 transition-transform duration-300" />
                        <p>UTK Chapter</p>
                    </div>
                    <div className="absolute top-full left-0 w-fit h-fit p-4 bg-primary border-accent border-2 rounded-md hidden group-hover:block">
                        <ul className="flex flex-col space-y-2">
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

            {/* Mobile menu button */}
            <button
                type="button"
                className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((v) => !v)}
            >
                {mobileOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>

            {/* Mobile panel */}
            {mobileOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-primary/95 backdrop-blur border-t border-white/10">
                    <div className="px-4 py-4 flex flex-col gap-3 text-lg">
                        <Link to="/" onClick={() => setMobileOpen(false)} className="py-2">Home</Link>
                        <Link to="/rush" onClick={() => setMobileOpen(false)} className="py-2">Rush</Link>

                        <button
                            type="button"
                            className="py-2 flex items-center justify-between"
                            onClick={() => setMobileDropdownOpen((v) => !v)}
                            aria-expanded={mobileDropdownOpen}
                        >
                            <span>UTK Chapter</span>
                            <ChevronUp className={`h-5 w-5 transition-transform ${mobileDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {mobileDropdownOpen && (
                            <div className="pl-4 flex flex-col gap-2">
                                {dropdownItems.map((item) => (
                                    <Link key={item.name} to={item.path} onClick={() => setMobileOpen(false)} className="py-1">
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        )}

                        <Link to="/merch" onClick={() => setMobileOpen(false)} className="py-2">Merch</Link>
                        <Link to="/contact" onClick={() => setMobileOpen(false)} className="py-2">Contact</Link>
                    </div>
                </div>
            )}
        </nav>
    )
}