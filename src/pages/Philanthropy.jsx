import Title from "../components/Title"
import PageContainer from "../components/PageContainer"
import Reveal from "../components/Reveal"
import { Link } from "react-router-dom"

export default function Philanthropy() {
  return (
    <PageContainer className="pb-20">
      <Title as="h1" text="Philanthropy" />

      <Reveal className="mt-12 max-w-4xl">
        <Title as="h2" className="!text-2xl sm:!text-4xl" text="Be The Match" />
        <p className="lineheight-2 mt-4 text-lg sm:text-xl">
          Lambda Phi Epsilon’s official philanthropy is the National Marrow Donor Program, operating as Be The Match. Through bone marrow donor registry drives, educational campaigns, and fundraising, we help patients battling blood cancers and other life-threatening diseases find life-saving matches.
        </p>
        <p className="lineheight-2 mt-4 text-lg sm:text-xl">
          Asian and minority communities are underrepresented in bone marrow registries, making our involvement especially meaningful. Every swab and every conversation can save a life.
        </p>
        <a
          href="https://bethematch.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block text-accent underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          Visit Be The Match →
        </a>
      </Reveal>

      <Reveal className="mt-14 max-w-4xl" delay={0.05}>
        <Title as="h2" className="!text-2xl sm:!text-4xl" text="Local Impact" />
        <p className="lineheight-2 mt-4 text-lg sm:text-xl">
          Beyond our national philanthropy, the Beta Kappa Chapter supports local community initiatives, campus charities, and cultural organizations to extend our impact beyond the fraternity.
        </p>
        <Link
          to="/contact"
          className="mt-6 inline-block text-accent underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          Want to partner with us? Get in touch →
        </Link>
      </Reveal>
    </PageContainer>
  )
}
