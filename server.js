const express=require("express");
const multer =require("multer");
const app=express();
const PORT=3000;
/*allow html file access*/
app.use(express.static(__dirname));
/*storage location*/
const storage=multer.diskStorage({destination:function(req,file,cb){cb(null,"uploads/");},});
const upload=multer({storage:storage});
/*test route*/
app.get("/",(req,res) => {res.send("Enterprise SOP Agent Server Running ");});
/*upload route*/
app.post("/upload", upload.single("file"),(req,res) => {res.send("File uploaded successfully");});
app.listen(PORT,() => {console.log("server running on port 3000");});
