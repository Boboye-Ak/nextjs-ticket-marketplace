import Head from "next/head"
import { MoralisProvider } from "react-moralis"
import "../styles/globals.css"
import "../styles/header.css"
import "../styles/find-event.css"
import "../styles/party-card.css"
import "../styles/buttons.css"
import "../styles/create-event.css"
import "../styles/loader.css"
import "../styles/event-page.css"
import "../styles/notification.css"
import "../styles/buy-ticket-modal.css"
import "../styles/switch.css"
function MyApp({ Component, pageProps }) {
    return (
        <>
            <Head>
                <title>Tick3t Booth</title>
                <meta name="description" content="Tick3t Booth" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <MoralisProvider initializeOnMount={false}>
                <Component {...pageProps} />
            </MoralisProvider>
        </>
    )
}

export default MyApp
