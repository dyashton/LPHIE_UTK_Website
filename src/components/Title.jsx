

export default function Title({ text, className }) {
    return (
        <h1 className={`text-3xl sm:text-5xl lg:text-6xl text-accent font-cinzel ${className}`}>{text}</h1>
    )
}