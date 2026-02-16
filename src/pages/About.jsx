import Title from "../components/Title"

export default function About() {
    return (
        <div className="w-full h-full pt-40 px-15 flex flex-col items-center justify-start">
            <Title className={"w-full text-start"} text="Beta Kappa Chapter" />
            <div className="main-content w-3/4 h-full mt-10 text-xl px-15 pb-20">
                <h1 className="mt-10 font-cinzel text-3xl mb-3 font-medium text-accent">What is Lambda Phi Epsilon?</h1>
                <p className="lineheight-2">Lambda Phi Epsilon is the world’s largest and fastest-growing international Asian-interest fraternity. Founded in 1981 at the University of California, Los Angeles, Lambda Phi Epsilon was established to provide a brotherhood that fosters leadership, academic excellence, cultural awareness, and community service.
                    Although rooted in Asian heritage, Lambda Phi Epsilon is open to men of all backgrounds who believe in its mission and values. The fraternity was created to address the need for stronger representation, unity, and leadership within the Asian-American community while building a network that extends far beyond college.
                    Today, Lambda Phi Epsilon has chapters across North America and continues to develop men into leaders who are committed to service, personal growth, and lifelong brotherhood.</p>

                <h1 className="mt-10 font-cinzel text-3xl mb-5 font-medium text-accent">About the Beta Kappa Chapter</h1>
                <p className="lineheight-2">The Beta Kappa Chapter of Lambda Phi Epsilon was founded at [Your University Name] with the purpose of creating a strong, values-driven brotherhood on campus. Since its establishment, Beta Kappa has been dedicated to cultivating leaders, scholars, and community advocates who positively impact both the university and the surrounding community.
                    Our chapter is built on unity, accountability, and growth. We support one another academically, professionally, and personally. Whether through campus involvement, cultural programming, philanthropy events, or social bonding, Beta Kappa strives to leave a lasting legacy.
                    As members of the Beta Kappa Chapter, we are more than just a fraternity — we are a family. Our alumni network, campus partnerships, and commitment to excellence continue to strengthen our impact year after year.</p>

                <h1 className="mt-10 font-cinzel text-3xl mb-5 font-medium text-accent">Our Mission</h1>
                <p className="lineheight-2">Our mission is to cultivate leadership, promote academic excellence, and strengthen community through lifelong brotherhood.
                    We aim to:
                    <ul className="list-disc list-inside lineheight-2">
                        <li>Develop principled leaders who serve with integrity</li>
                        <li>Encourage academic and professional achievement</li>
                        <li>Promote Asian awareness and cultural appreciation</li>
                        <li>Support philanthropic and community initiatives</li>
                        <li>Build bonds that extend beyond college</li>
                    </ul>

                    Through structured development programs, mentorship, and active campus involvement, we prepare our members not only for success in college, but for success in life.</p>

                <h1 className="mt-10 font-cinzel text-3xl mb-5 font-medium text-accent">Our Values</h1>
                <ul className="list-inside lineheight-2">
                    <li><p className="font-cinzel font-semibold pl-5 text-accent">Authenticity - </p>We believe in being real — with ourselves and with each other. Authenticity means showing up without masks, embracing our identities, and standing firm in our principles. We encourage every brother to express who he truly is while honoring the individuality of others. Growth begins with honesty.</li>
                    <li><p className="font-cinzel font-semibold pl-5 text-accent">Courageous Leadership - </p>Leadership is not about titles — it is about action. Courageous Leadership means stepping forward when it matters most, even when it is uncomfortable. We challenge ourselves to make difficult decisions, speak up for what is right, and serve as role models on campus and beyond. We lead with conviction, humility, and accountability.</li>
                    <li><p className="font-cinzel font-semibold pl-5 text-accent">Cultural Heritage - </p>Our fraternity was founded to uplift and empower the Asian American community. We honor our roots by educating, advocating, and celebrating the diverse cultures that shape our identities. Cultural Heritage reminds us that representation matters — and that preserving our history strengthens our future.</li>
                    <li><p className="font-cinzel font-semibold pl-5 text-accent">Love - </p>Love is the foundation of brotherhood. It is expressed through loyalty, sacrifice, support, and trust. We stand beside one another in moments of success and adversity alike. The bonds we build are not temporary — they are lifelong.</li>
                    <li><p className="font-cinzel font-semibold pl-5 text-accent">Wisdom - </p>We pursue knowledge not only in the classroom, but in life. Wisdom means learning from experience, seeking mentorship, and striving for continuous self-improvement. We value thoughtful action, informed leadership, and the humility to keep growing.</li>
                </ul>

                <h1 className="mt-10 font-cinzel text-3xl mb-5 font-medium text-accent" >Our Philanthropy</h1>
                <p className="lineheight-2">Lambda Phi Epsilon’s official philanthropy is the National Marrow Donor Program, operating as Be The Match. Through bone marrow donor registry drives, educational campaigns, and fundraising initiatives, we work to help patients battling blood cancers and other life-threatening diseases find life-saving matches.
                    Asian and minority communities are underrepresented in bone marrow registries, making our involvement especially meaningful. By hosting donor drives and spreading awareness, we actively work to save lives.
                    In addition to our national philanthropy, the Beta Kappa Chapter also supports local community initiatives, campus charities, and cultural organizations to extend our impact beyond our fraternity.</p>
            </div>
        </div>
    )
}