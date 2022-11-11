import { NFTStorage, File } from "nft.storage"
import { sendFileToNFTStorage } from "../../utils/nft-storage"
import multer from "multer"
import nextConnect from "next-connect"
import mime from "mime"
import fs from "fs"
import path from "path"

export const config = {
    api: {
        bodyParser: false,
    },
}

const fileFromPath = async (filePath) => {
    const content = await fs.promises.readFile(filePath)
    const type = mime.getType(filePath)
    return new File([content], path.basename(filePath), { type })
}

const storage = multer.diskStorage({
    filename: (req, file, callBack) => {
        callBack(null, Date.now() + "-" + file.originalname)
    },
})

//const storage = multer.memoryStorage()
const upload = multer({
    storage: storage,
    limits: {
        fieldSize: 1024 * 1024 * 20,
    },
})

const apiRoute = nextConnect()
    .use(upload.single("image"))
    .post(async (req, res) => {
        console.log(req.file)
        const filePath = req.file.path
        const imageFileObject = await fileFromPath(filePath)
        const client = new NFTStorage({ token: process.env.NFT_STORAGE_API_KEY })
        let url = await sendFileToNFTStorage(client, {
            fileImg: imageFileObject,
            name: req.body.name,
            description: req.body.description || "Set Description",
            venue: req.body.venue || "Set Venue",
            date: req.body.date || "Set Date",
        })

        await res.status(200).json({ url })
    })

export default apiRoute
