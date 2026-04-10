const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

let sopText = "";

/* file upload storage */

const storage = multer.diskStorage({

destination: function (req, file, cb) {

cb(null, "uploads/");

},

filename: function (req, file, cb) {

cb(null, file.originalname);

}

});

const upload = multer({ storage });

/* open upload page */

app.get("/", (req,res)=>{

res.sendFile(path.join(__dirname,"upload.html"));

});

/* upload pdf */

app.post("/upload", upload.single("pdf"), async (req,res)=>{

try{

const pdfBuffer = fs.readFileSync(req.file.path);

const pdfData = await pdfParse(pdfBuffer);

sopText = pdfData.text;

console.log("PDF text saved");

res.redirect("/ask.html");

}

catch(error){

console.log(error);

res.send("Error uploading PDF");

}

});

/* ask question */

app.post("/ask",(req,res)=>{

try{

if(!sopText){

return res.json({

answer:"Please upload SOP PDF first"

});

}

const question = req.body.question.toLowerCase();

const lines = sopText.split("\n");

/* find matching line */

let startIndex = -1;

for(let i=0;i<lines.length;i++){

let line = lines[i].toLowerCase();

if(line.includes(question)){

startIndex = i;

break;

}

}

/* keyword fallback search */

if(startIndex === -1){

let words = question.split(" ");

for(let i=0;i<lines.length;i++){

let line = lines[i].toLowerCase();

for(let word of words){

if(word.length > 4 && line.includes(word)){

startIndex = i;

break;

}

}

if(startIndex !== -1){

break;

}

}

}

/* no result */

if(startIndex === -1){

return res.json({

answer:"I don't know based on SOP"

});

}

/* collect section text */

let resultLines = [];

for(let i=startIndex;i<lines.length;i++){

let currentLine = lines[i];

/* stop when next section number appears */

if(i>startIndex && /^\d+\./.test(currentLine.trim())){

break;

}

resultLines.push(currentLine);

}

/* send answer */

res.json({

answer:"According to SOP:\n\n" + resultLines.join("\n")

});

}

catch(error){

console.log(error);

res.json({

answer:"Error getting answer"

});

}

});

/* start server */

app.listen(PORT,()=>{

console.log("Server running on http://localhost:"+PORT);

});