export default function InstagramStrip({ className = "" }) {
  return (
    <div className={`w-full border border-tertiary/30 bg-primary/50 px-5 py-6 sm:px-8 sm:py-8 ${className}`}>
      <p className="font-cinzel text-xl sm:text-2xl text-text-primary">See the chapter live</p>
      <p className="mt-2 text-text-secondary text-base sm:text-lg max-w-xl">
        Photos, events, and brotherhood moments — follow us on Instagram.
      </p>
      <a
        href="https://www.instagram.com/utklphie/"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block text-accent font-cinzel text-lg underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      >
        @lphie_utk
      </a>
    </div>
  )
}
