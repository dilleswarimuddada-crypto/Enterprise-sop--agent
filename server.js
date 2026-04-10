const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

let pdfText = "";

/* upload setup */
const storage = multer.diskStorage({

destination: function(req,file,cb){
cb(null,"uploads");
},

filename: function(req,file,cb){
cb(null,file.originalname);
}

});

const upload = multer({storage:storage});


/* upload PDF */
app.post("/upload", upload.single("pdf"), async (req,res)=>{

try{

const buffer = fs.readFileSync(req.file.path);

const data = await pdfParse(buffer);

pdfText = data.text.toLowerCase();

console.log("PDF text loaded");

res.send("PDF uploaded successfully");

}

catch(error){

console.log(error);

res.send("Upload error");

}

});


/* ask question */
app.post("/ask", (req,res)=>{

const question = req.body.question.toLowerCase();

const words = question.split(" ");

const lines = pdfText.split("\n");

let matches = [];

for(let line of lines){

for(let word of words){

if(line.includes(word)){

matches.push(line.trim());

break;

}

}

}

matches = [...new Set(matches)];

matches = matches.slice(0,5);

if(matches.length===0){

return res.json({
answer:"No result found"
});

}

res.json({
answer: matches.join("\n")
});

});


/* start server */
app.listen(PORT, ()=>{

console.log("Server running on http://localhost:3000");

});