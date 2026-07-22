import { Link, NavLink, useLocation } from 'react-router-dom'
import { ChevronUp, Menu, X } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'

const dropdownItems = [
    { name: 'Family Tree', path: '/family-tree' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'About Us', path: '/about' },
    { name: 'Philanthropy', path: '/philanthropy' },
]

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false)
    const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false)
    const menuButtonRef = useRef(null)
    const mobileFirstLinkRef = useRef(null)
    const desktopDropdownRef = useRef(null)
    const desktopDropdownId = useId()
    const location = useLocation()

    const linkBaseClassName = "rounded-sm px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 hover:text-white/90"
    const navLinkClassName = ({ isActive }) =>
        `${linkBaseClassName} ${isActive ? "text-white underline underline-offset-8 decoration-white/70" : ""}`

    // Showcase products (Brothers, Timeline) at top level; rest in dropdown
    const desktopItems = useMemo(() => ([
        { name: 'Home', path: '/' },
        { name: 'Brothers', path: '/brothers' },
        { name: 'Timeline', path: '/chapter-timeline' },
        { name: 'Rush', path: '/rush' },
        { name: 'Merch', path: '/merch' },
        { name: 'Contact', path: '/contact' },
    ]), [])

    useEffect(() => {
        function onKeyDown(e) {
            if (e.key === 'Escape') {
                setMobileOpen(false)
                setMobileDropdownOpen(false)
                setDesktopDropdownOpen(false)
                if (menuButtonRef.current) menuButtonRef.current.focus()
            }
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [])

    useEffect(() => {
        queueMicrotask(() => {
            setMobileOpen(false)
            setMobileDropdownOpen(false)
            setDesktopDropdownOpen(false)
        })
    }, [location.pathname])

    useEffect(() => {
        if (!mobileOpen) return;
        const t = setTimeout(() => {
            mobileFirstLinkRef.current?.focus?.()
        }, 0)
        return () => clearTimeout(t)
    }, [mobileOpen])

    useEffect(() => {
        function onPointerDown(e) {
            if (!desktopDropdownOpen) return;
            const el = desktopDropdownRef.current
            if (el && !el.contains(e.target)) {
                setDesktopDropdownOpen(false)
            }
        }
        document.addEventListener('pointerdown', onPointerDown)
        return () => document.removeEventListener('pointerdown', onPointerDown)
    }, [desktopDropdownOpen])

    return (
        <nav className="bg-linear-to-b from-accent to-transparent text-white flex items-start justify-between px-4 py-4 sm:px-8 sm:py-6 relative">
            <Link to="/" onClick={() => setMobileOpen(false)}>
                <span className="text-3xl sm:text-5xl font-cinzel leading-none" aria-label="Lambda Phi Epsilon">ΛΦΕ</span>
            </Link>

            <ul className="hidden md:flex items-center gap-5 lg:gap-8 text-base lg:text-xl xl:text-2xl flex-wrap justify-end">
                {desktopItems.map((item) => (
                    <li key={item.path}>
                        <NavLink to={item.path} className={navLinkClassName}>
                            {item.name}
                        </NavLink>
                    </li>
                ))}

                <li ref={desktopDropdownRef} className="relative">
                    <button
                        type="button"
                        className={`${linkBaseClassName} inline-flex items-center gap-2`}
                        aria-haspopup="menu"
                        aria-expanded={desktopDropdownOpen}
                        aria-controls={desktopDropdownId}
                        onClick={() => setDesktopDropdownOpen((v) => !v)}
                    >
                        <ChevronUp className={`h-5 w-5 transition-transform duration-200 ${desktopDropdownOpen ? "rotate-180" : ""}`} />
                        <span>More</span>
                    </button>
                    {desktopDropdownOpen && (
                        <div
                            id={desktopDropdownId}
                            role="menu"
                            className="absolute top-full right-0 mt-2 w-fit h-fit p-4 bg-primary border-accent border-2 rounded-md shadow-lg"
                        >
                            <ul className="flex flex-col space-y-2">
                                {dropdownItems.map((item) => (
                                    <li key={item.name} role="none">
                                        <NavLink
                                            to={item.path}
                                            role="menuitem"
                                            className={({ isActive }) => `${linkBaseClassName} text-lg whitespace-nowrap block ${isActive ? "underline underline-offset-8 decoration-accent/70" : ""}`}
                                            onClick={() => setDesktopDropdownOpen(false)}
                                        >
                                            {item.name}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </li>
            </ul>

            <button
                type="button"
                ref={menuButtonRef}
                className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                onClick={() => {
                    setMobileOpen((v) => {
                        const next = !v
                        if (next) setMobileDropdownOpen(false)
                        return next
                    })
                }}
            >
                {mobileOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>

            {mobileOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-primary/95 backdrop-blur border-t border-white/10">
                    <div className="px-4 py-4 flex flex-col gap-3 text-lg">
                        <NavLink ref={mobileFirstLinkRef} to="/" onClick={() => setMobileOpen(false)} className={({ isActive }) => `py-2 ${isActive ? "underline underline-offset-8 decoration-white/70" : ""}`}>Home</NavLink>
                        <NavLink to="/brothers" onClick={() => setMobileOpen(false)} className={({ isActive }) => `py-2 ${isActive ? "underline underline-offset-8 decoration-white/70" : ""}`}>Brothers</NavLink>
                        <NavLink to="/chapter-timeline" onClick={() => setMobileOpen(false)} className={({ isActive }) => `py-2 ${isActive ? "underline underline-offset-8 decoration-white/70" : ""}`}>Timeline</NavLink>
                        <NavLink to="/rush" onClick={() => setMobileOpen(false)} className={({ isActive }) => `py-2 ${isActive ? "underline underline-offset-8 decoration-white/70" : ""}`}>Rush</NavLink>

                        <button
                            type="button"
                            className="py-2 flex items-center justify-between"
                            onClick={() => setMobileDropdownOpen((v) => !v)}
                            aria-expanded={mobileDropdownOpen}
                        >
                            <span>More</span>
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

                        <NavLink to="/merch" onClick={() => setMobileOpen(false)} className={({ isActive }) => `py-2 ${isActive ? "underline underline-offset-8 decoration-white/70" : ""}`}>Merch</NavLink>
                        <NavLink to="/contact" onClick={() => setMobileOpen(false)} className={({ isActive }) => `py-2 ${isActive ? "underline underline-offset-8 decoration-white/70" : ""}`}>Contact</NavLink>
                    </div>
                </div>
            )}
        </nav>
    )
}
