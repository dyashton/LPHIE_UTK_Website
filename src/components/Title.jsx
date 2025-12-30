

export default function Title({ text, className }) {
    return (
        <div>
            <h1 className={`text-6xl text-accent font-cinzel ${className}`}>{text}</h1>
        </div>
    )
}