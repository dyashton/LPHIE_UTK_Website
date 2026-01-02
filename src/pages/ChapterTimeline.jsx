import Title from "../components/Title"
import { motion } from "framer-motion"
const timelineEvents = [
    {
        year: "1981",
        event: "National Founding",
        description: "The fraternity was founded nationally in 1981, establishing its core values and mission."
    },
    {

        year: "2020",
        event: "Chapter Founded",
        description: "Our chapter was founded in 2020 with a mission to foster brotherhood and excellence."
    },
    {
        year: "2020",
        event: "First Community Service",
        description: "We organized our first community service event, helping local shelters."
    },
]


export default function ChapterTimeline() {
    return (
        <div className="pt-40 pl-15">
            <Title text="Chapter Timeline" />
            <div className="timeline-container mt-10 p-5">
                <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="timeline-line border-l-4 border-secondary relative pb-10">
                    {timelineEvents.map((item, index) => (
                        <div key={index} className="timeline-event mb-8 relative">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.3 }}
                                className="w-5 h-5 rounded-full bg-accent absolute top-0 -left-3" />
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.3 + 0.2 }}
                                className="pl-10 relative -top-2">
                                <h3 className="text-2xl font-bold">{item.year} - {item.event}</h3>
                                <p className="mt-2 text-lg">{item.description}</p>
                            </motion.div>
                        </div>
                    ))}
                    <div className="w-5 h-5 rounded-full bg-text-primary absolute bottom-0 -left-3" />
                </motion.div>
            </div>
        </div>
    )
}