import Navbar from "./Navbar"
import LPHIELogo from "../assets/logo.png"

export default function Layout({ children }) {
    return (
        <div className="w-full h-full flex flex-col relative bg-background overflow-auto">
            <div className="w-full h-full absolute top-0 left-0" style={{ backgroundImage: `url(${LPHIELogo})`, backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundSize: '50%', opacity: 0.8 }} />

            <div className="absolute top-0 left-0 w-full z-2">
                <Navbar />
            </div>
            <div className="relative z-1 flex-1">
                {children}
            </div>
        </div>
    )
}