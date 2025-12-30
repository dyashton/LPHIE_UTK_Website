import Navbar from "./Navbar"

export default function Layout({ children }) {
    return (
        <div className="w-full h-full flex flex-col relative bg-background" >
            <div className="absolute top-0 left-0 w-full z-2">
                <Navbar />
            </div>
            {children}
        </div>
    )
}