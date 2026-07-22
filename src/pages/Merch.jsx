import Title from "../components/Title"
import PageContainer from "../components/PageContainer"
import Reveal from "../components/Reveal"
import logo from "../assets/logo.svg"

const products = [
  {
    name: "Chapter Tee",
    blurb: "Classic Beta Kappa wordmark on soft cotton.",
  },
  {
    name: "Rush Hoodie",
    blurb: "Heavyweight hoodie for cool Knoxville nights.",
  },
  {
    name: "ΛΦΕ Cap",
    blurb: "Embroidered Greek letters — everyday wear.",
  },
]

export default function Merch() {
  return (
    <PageContainer className="pb-20">
      <Title as="h1" text="Merch" />

      <Reveal className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {products.map((p) => (
          <div key={p.name} className="flex flex-col">
            <div className="aspect-square bg-primary/80 border border-tertiary/30 flex items-center justify-center">
              <img src={logo} alt="" className="w-1/2 opacity-40" />
            </div>
            <h2 className="mt-4 font-cinzel text-xl text-text-primary">{p.name}</h2>
            <p className="mt-1 text-text-secondary">{p.blurb}</p>
          </div>
        ))}
      </Reveal>

      <Reveal className="mt-12">
        <a
          href="https://www.instagram.com/utklphie/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block font-cinzel text-lg text-accent underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          Order via @lphie_utk →
        </a>
      </Reveal>
    </PageContainer>
  )
}
