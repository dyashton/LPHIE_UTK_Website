import { Link } from "react-router-dom"
import DragonSeal from "./DragonSeal"

const socials = [
  { name: "Instagram", href: "https://www.instagram.com/utklphie/" },
  { name: "Facebook", href: "https://www.facebook.com/lphie.utk" },
  { name: "LinkedIn", href: "https://www.linkedin.com/company/lambda-phi-epsilon-utk" },
]

const chapterLinks = [
  { name: "Brothers", path: "/brothers" },
  { name: "Chapter Timeline", path: "/chapter-timeline" },
  { name: "Family Tree", path: "/family-tree" },
  { name: "Gallery", path: "/gallery" },
  { name: "About", path: "/about" },
]

export default function Footer() {
  return (
    <footer className="relative z-10 mt-auto border-t border-tertiary/20 bg-primary/80">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 py-10 sm:py-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-text-secondary">
        <div>
          <div className="flex items-center gap-3">
            <DragonSeal size={40} className="shrink-0" />
            <p className="font-cinzel text-2xl text-text-primary">ΛΦΕ</p>
          </div>
          <p className="mt-2 text-sm sm:text-base">
            Beta Kappa Chapter · University of Tennessee, Knoxville
          </p>
          <a
            className="mt-3 inline-block text-accent underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            href="mailto:ady@vols.utk.edu"
          >
            ady@vols.utk.edu
          </a>
        </div>

        <div>
          <p className="font-cinzel text-lg text-text-primary mb-3">Chapter</p>
          <ul className="space-y-2">
            {chapterLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className="hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 rounded-sm"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-cinzel text-lg text-text-primary mb-3">Follow Us</p>
          <ul className="space-y-2">
            {socials.map((s) => (
              <li key={s.name}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                >
                  {s.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-tertiary/10 py-4 text-center text-xs text-text-secondary">
        © {new Date().getFullYear()} Lambda Phi Epsilon — Beta Kappa Chapter
      </div>
    </footer>
  )
}
