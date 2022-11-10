import { chains, supportedChains } from "../../constants"
import { dec2Hex } from "../../utils/converter"
import { useChain } from "react-moralis"
const UnsupportedChain = () => {
    const { switchNetwork, chainId, chain, account } = useChain()
    return (
        <div className="unsupported-chain">
            <div>THIS CHAIN IS NOT SUPPORTED. SWITCH TO ANY OF THESE</div>
            <div>
                <ul>
                    {supportedChains?.map((chain, index) => {
                        return (
                            <li
                                onClick={() => {
                                    switchNetwork(`0x${dec2Hex(chain.chainId)}`)
                                }}
                            >
                                {chain.name}
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    )
}

export default UnsupportedChain
