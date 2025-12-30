import bgimg from "../assets/bgimg.jpeg"

export default function Home() {
    return (
        <div className="w-full h-full relative">
            <div className="absolute w-full h-full " style={{ backgroundImage: `url(${bgimg})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.5 }} />
            <div className="relative pt-40 pl-15 z-1">
                <h1 className="text-accent text-8xl">Lambda Phi Epsilon</h1>
                <h1 className="text-text-primary text-4xl">University of Tennessee, Knoxville</h1>
            </div>
        </div>
    )
}