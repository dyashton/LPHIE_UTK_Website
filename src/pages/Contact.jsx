import Title from "../components/Title"
import PageContainer from "../components/PageContainer"
import Reveal from "../components/Reveal"

export default function Contact() {
    return (
        <PageContainer className="pb-20">
            <Title as="h1" text="Contact" />

            <div className="main-content mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10 w-full">
                <Reveal className="lg:col-span-2 flex flex-col items-start">
                    <Title as="h2" className="!text-2xl sm:!text-4xl mb-4" text="Interested in Joining?" />
                    <p className="text-lg">
                        Fill out the form below or email{" "}
                        <a
                            className="text-accent underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                            href="mailto:ady@vols.utk.edu"
                        >
                            ady@vols.utk.edu
                        </a>
                        .
                    </p>
                    <div className="w-full mt-6 border border-tertiary/40 bg-primary/60">
                        <iframe
                            title="Lambda Phi Epsilon UTK interest form"
                            src="https://docs.google.com/forms/d/e/1FAIpQLSfKC8ET91TtOUdHLDiq2BQEHO-QRqdhP1KCGpkW0EzGfVtkAA/viewform?embedded=true"
                            className="w-full h-[900px] sm:h-[1000px]"
                        >
                            Loading…
                        </iframe>
                    </div>
                </Reveal>

                <Reveal className="lg:col-span-1 space-y-10" delay={0.05}>
                    <div>
                        <Title as="h2" className="!text-2xl sm:!text-3xl mb-4" text="General & Alumni" />
                        <p className="text-text-secondary">
                            Alumni, parents, and campus partners — email us anytime. We&apos;d love to hear from you.
                        </p>
                        <a
                            className="mt-3 inline-block text-accent underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                            href="mailto:ady@vols.utk.edu"
                        >
                            ady@vols.utk.edu
                        </a>
                    </div>

                    <div>
                        <Title as="h2" className="!text-2xl sm:!text-3xl mb-4" text="Follow Us" />
                        <p className="text-text-secondary">Stay connected through our social channels:</p>
                        <ul className="list-disc list-inside mt-3 space-y-2">
                            <li>
                                <a
                                    className="text-accent underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                                    href="https://www.facebook.com/lphie.utk"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Facebook
                                </a>
                            </li>
                            <li>
                                <a
                                    className="text-accent underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                                    href="https://www.instagram.com/utklphie/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Instagram
                                </a>
                            </li>
                            <li>
                                <a
                                    className="text-accent underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                                    href="https://www.linkedin.com/company/lambda-phi-epsilon-utk"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    LinkedIn
                                </a>
                            </li>
                        </ul>
                    </div>
                </Reveal>
            </div>
        </PageContainer>
    )
}
