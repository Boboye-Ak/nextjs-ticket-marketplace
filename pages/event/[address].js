import { useRouter } from "next/router"
import Header from "../../components/Header/Header"
import styles from "../../styles/Home.module.css"

const eventPage = () => {
    const router = useRouter()
    const partyAddress = router.query.address ? router.query.address : null
    return (
        <div className={styles.container}>
            <Header />
        </div>
    )
}

export default eventPage
