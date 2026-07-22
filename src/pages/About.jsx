import Title from "../components/Title"
import PageContainer from "../components/PageContainer"
import Reveal from "../components/Reveal"
import InstagramStrip from "../components/InstagramStrip"
import { Link } from "react-router-dom"

const values = [
  {
    name: "Authenticity",
    text: "We believe in being real — with ourselves and with each other. Authenticity means showing up without masks, embracing our identities, and standing firm in our principles.",
  },
  {
    name: "Courageous Leadership",
    text: "Leadership is not about titles — it is about action. We challenge ourselves to make difficult decisions, speak up for what is right, and serve as role models on campus and beyond.",
  },
  {
    name: "Cultural Heritage",
    text: "Our fraternity was founded to uplift and empower the Asian American community. We honor our roots by educating, advocating, and celebrating the cultures that shape our identities.",
  },
  {
    name: "Love",
    text: "Love is the foundation of brotherhood — loyalty, sacrifice, support, and trust. The bonds we build are not temporary; they are lifelong.",
  },
  {
    name: "Wisdom",
    text: "We pursue knowledge in the classroom and in life. Wisdom means learning from experience, seeking mentorship, and striving for continuous self-improvement.",
  },
]

export default function About() {
  return (
    <PageContainer className="pb-20">
      <Title as="h1" text="Beta Kappa Chapter" />

      <Reveal className="mt-12">
        <Title as="h2" className="!text-2xl sm:!text-4xl" text="What is Lambda Phi Epsilon?" />
        <p className="lineheight-2 mt-4 text-lg sm:text-xl max-w-4xl">
          Lambda Phi Epsilon is the world’s largest and fastest-growing international Asian-interest fraternity. Founded in 1981 at UCLA, it fosters leadership, academic excellence, cultural awareness, and community service. Although rooted in Asian heritage, Lambda Phi Epsilon is open to men of all backgrounds who believe in its mission and values.
        </p>
      </Reveal>

      <Reveal className="mt-12" delay={0.05}>
        <Title as="h2" className="!text-2xl sm:!text-4xl" text="About the Beta Kappa Chapter" />
        <p className="lineheight-2 mt-4 text-lg sm:text-xl max-w-4xl">
          The Beta Kappa Chapter of Lambda Phi Epsilon was founded at the University of Tennessee, Knoxville with the purpose of creating a strong, values-driven brotherhood on campus. Since our founding as an associate chapter in 2020 and lettering as Beta Kappa in June 2025, we have been dedicated to cultivating leaders, scholars, and community advocates who positively impact the university and the surrounding community.
        </p>
        <p className="lineheight-2 mt-4 text-lg sm:text-xl max-w-4xl">
          Our chapter is built on unity, accountability, and growth. Whether through campus involvement, cultural programming, philanthropy, or social bonding, Beta Kappa strives to leave a lasting legacy. We are more than a fraternity — we are a family.
        </p>
        <div className="mt-6 flex flex-wrap gap-4 text-accent">
          <Link to="/brothers" className="underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60">Meet the Brothers</Link>
          <Link to="/chapter-timeline" className="underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60">Chapter Timeline</Link>
          <Link to="/family-tree" className="underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60">Family Tree</Link>
        </div>
      </Reveal>

      <Reveal className="mt-14" delay={0.05}>
        <Title as="h2" className="!text-2xl sm:!text-4xl" text="Our Mission" />
        <p className="mt-4 text-xl sm:text-2xl font-cinzel text-text-primary max-w-3xl">
          Cultivate leadership, promote academic excellence, and strengthen community through lifelong brotherhood.
        </p>
      </Reveal>

      <Reveal className="mt-14" delay={0.05}>
        <Title as="h2" className="!text-2xl sm:!text-4xl mb-8" text="Our Values" />
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
          {values.map((v) => (
            <li key={v.name}>
              <h3 className="font-cinzel font-semibold text-accent text-xl sm:text-2xl">{v.name}</h3>
              <p className="mt-2 text-base sm:text-lg text-text-secondary leading-relaxed">{v.text}</p>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal className="mt-14" delay={0.05}>
        <Title as="h2" className="!text-2xl sm:!text-4xl" text="Our Philanthropy" />
        <p className="lineheight-2 mt-4 text-lg sm:text-xl max-w-4xl">
          Our national philanthropy is Be The Match (National Marrow Donor Program). Asian and minority communities are underrepresented in bone marrow registries — our drives and awareness work help close that gap.
        </p>
        <Link
          to="/philanthropy"
          className="mt-4 inline-block text-accent underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          Learn more about our philanthropy →
        </Link>
      </Reveal>

      <Reveal className="mt-14">
        <InstagramStrip />
      </Reveal>
    </PageContainer>
  )
}
