const express = require("express")
const cors = require("cors")
const { errorHandler } = require("./middleware/errorMiddleware")
const app = express()
const PORT = 5000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({ origin: "http://localhost:5173" }))

app.use("/api", require("./routes/todosRoutes"))
// app.get("*", (req, res) => {
//   res.json({ message: "To Do API" })
// })
app.use(errorHandler)
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT} 에서 서버 실행중`)
})
