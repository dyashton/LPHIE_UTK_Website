import Title from "../components/Title"
import PageContainer from "../components/PageContainer"

export default function Merch() {
    return (
        <PageContainer className="pb-16 pt-20">
            <Title as="h1" text="Merch" />
            <div className="text-center text-2xl mt-10 text-text-secondary">
                Coming Soon!
            </div>
        </PageContainer>
    )
}