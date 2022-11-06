import { useRouter } from "next/router"
import Event from "../../components/Event"
import Header from "../../components/Header/Header"
import styles from "../../styles/Home.module.css"

const eventPage = () => {
    const router = useRouter()
    const partyAddress = router.query.address ? router.query.address : null
    return (
        <div className={styles.container}>
            <Header />
            <Event partyAddress={partyAddress} />
        </div>
    )
}

export default eventPage
