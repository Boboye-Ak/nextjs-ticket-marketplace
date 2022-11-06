import Header from "../components/Header/Header"
import WalletEvents from "../components/WalletEvents"
import styles from "../styles/Home.module.css"
import { useMoralis } from "react-moralis"
import { chains, partyFactoryAddresses, partyFactoryAbi, partyAbi } from "../constants"
import UnsupportedChain from "../components/Full Screen Components/UnsupportedChain"
const myEventsPage = () => {
    const { chainId: chainIdHex, isWeb3Enabled, account } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const partyFactoryAddress =
        chainId in partyFactoryAddresses ? partyFactoryAddresses[chainId][0] : null
    let activeChain = chains.filter((chain) => {
        if (chain.chainId == chainId) {
            return chain
        }
    })
    activeChain = activeChain[0]
    return (
        <div className={styles.container}>
            <Header />
            <WalletEvents wallet={account} />
            {!partyFactoryAddress && account && <UnsupportedChain />}
        </div>
    )
}

export default myEventsPage
