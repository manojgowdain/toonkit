import express from "express"
import { toon } from "toonkit2/express"
const app = express()


app.use(...toon())
app.get("/", (req, res) => {

    const json ={
        message: "Hello World",
        'status': "success"
    }
    res.toon(json)
})

app.post("/json", (req, res) => {
    const json = req.toon()
    console.log(json)
    res.toon(json)
})

app.post("/", (req, res) => {

    const toon  = req.toon()
    console.log(toon)

    res.send(toon)
     
})

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})