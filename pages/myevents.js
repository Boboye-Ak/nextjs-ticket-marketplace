import Header from "../components/Header/Header"
import MyEvents from "../components/MyEvents"
import styles from "../styles/Home.module.css"
const myEventsPage = () => {
    return (
        <div className={styles.container}>
            <Header />
            <MyEvents/>
        </div>
    )
}

export default myEventsPage
