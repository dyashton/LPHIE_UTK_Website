import Title from "../components/Title"

export default function Contact() {
    return (
        <div className="w-full h-full pt-40 px-15">
            <Title text="Contact" />
            <div className="main-content mt-10 mb-20 flex flex-row w-full">
                <div className="left-content w-3/4 flex flex-col items-center">
                    <h1 className="mt-10 font-cinzel text-3xl mb-5 font-medium text-accent">Interested In Joining?</h1>
                    <p>Fill out the form below or contact us at <a href="mailto:ady@vols.utk.edu">ady@vols.utk.edu</a>.</p>
                    <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSfKC8ET91TtOUdHLDiq2BQEHO-QRqdhP1KCGpkW0EzGfVtkAA/viewform?embedded=true"
                        width="600"
                        height="1000"
                    >Loading…</iframe>
                </div>
                <div className="right-content w-1/4">
                    <h1 className="mt-10 font-cinzel text-3xl mb-5 font-medium text-accent">Follow Us</h1>
                    <p>Stay connected with us through our social media channels:</p>
                    <ul className="list-disc list-inside">
                        <li><a href="https://www.facebook.com/lphie.utk" target="_blank" rel="noopener noreferrer">Facebook</a></li>
                        <li><a href="https://www.instagram.com/lphie_utk/" target="_blank" rel="noopener noreferrer">Instagram</a></li>
                        <li><a href="https://www.linkedin.com/company/lambda-phi-epsilon-utk" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
                    </ul>
                </div>
            </div>
        </div>
    )
}