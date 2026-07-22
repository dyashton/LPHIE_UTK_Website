import Navbar from "./Navbar"
import Footer from "./Footer"
import CursorClouds from "./CursorClouds"
import LPHIELogo from "../assets/logo.svg"

export default function Layout({ children }) {
    return (
        <div className="w-full min-h-dvh flex flex-col relative bg-background">
            <div
                className="absolute top-0 left-0 right-0 inset-0 w-full h-full pointer-events-none"
                style={{
                    backgroundImage: `url(${LPHIELogo})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundSize: 'clamp(220px, 55vw, 520px)',
                    opacity: 0.12
                }}
                aria-hidden="true"
            />

            <CursorClouds />

            <header className="absolute top-0 left-0 right-0 z-50 w-full">
                <Navbar />
            </header>
            <div className="relative z-10 flex-1 min-w-0 overflow-x-hidden">
                {children}
            </div>
            <Footer />
        </div>
    )
}