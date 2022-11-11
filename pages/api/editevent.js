import { NFTStorage, File } from "nft.storage"
import multer from "multer"
import nextConnect from "next-connect"

export const config = {
    api: {
        bodyParser: false,
    },
}

const storage = multer.memoryStorage()
const upload = multer({
    storage: storage,
    limits: {
        fieldSize: 1024 * 1024 * 20,
    },
})

const apiRoute = nextConnect()
    .use(upload.single("image"))
    .post(async (req, res) => {
        console.log(req.body)
        const client = new NFTStorage({ token: process.env.NFT_STORAGE_API_KEY })
        res.status(200).json({ hello: "hello" })
    })

export default apiRoute
