import { NFTStorage, File } from "nft.storage"

const sendFileToNFTStorage = async (client, { fileImg, name, description, venue, date }) => {
    if (fileImg) {
        try {
            const metadata = await client.store({
                name: name || "*Please set name in Name modal*",
                image: fileImg,
                description: description || "*Please give a decription in edit modal.*",
                venue: venue,
                date: date,
            })
            return metadata.url
        } catch (e) {
            console.log(e)
        }
    }
}

const toImgObject = async (url) => {
    const res = await fetch(url)
    const blob = await res.blob()
    return blob
}

const fileToBlob = async (file) =>
    new Blob([new Uint8Array(await file.arrayBuffer())], { type: file.type })

module.exports = { sendFileToNFTStorage, toImgObject, fileToBlob }
