import Navbar from "./Navbar"
import LPHIELogo from "../assets/logo.svg"

export default function Layout({ children }) {
    return (
        <div className="w-full min-h-dvh flex flex-col relative bg-background overflow-x-hidden">
            <div
                className="fixed inset-0 w-full h-full pointer-events-none"
                style={{
                    backgroundImage: `url(${LPHIELogo})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundSize: 'clamp(220px, 55vw, 520px)',
                    opacity: 0.12
                }}
            />

            <div className="absolute top-0 left-0 w-full z-20">
                <Navbar />
            </div>
            <div className="relative z-10 flex-1">
                {children}
            </div>
        </div>
    )
}