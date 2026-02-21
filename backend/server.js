import app from "./src/app.js";
import connectDB from "./src/db/db.js";

connectDB();
const PORT = process.env.PORT || 5000;
app.listen(PORT , (req, res)=>{
    console.log("Server is running on port " + PORT);
    console.log("http://localhost:" + PORT);
})