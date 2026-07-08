export default function Title({ text, className = "", as: As = "h2" }) {
    const Component = As;
    return (
        <Component className={`text-left text-3xl sm:text-5xl lg:text-6xl text-accent font-cinzel ${className}`}>{text}</Component>
    )
}