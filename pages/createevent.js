import CreateEvent from "../components/CreateEvent"
import Header from "../components/Header/Header"
import styles from "../styles/Home.module.css"
const createEvent = () => {
    return (
        <div className={styles.container}>
            <Header />
            <CreateEvent />
        </div>
    )
}

export default createEvent
