const express = require("express");
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = 3000;

/* allow html page */
app.use(express.static("."));

/* MongoDB connection */
const uri = "mongodb+srv://Dilleswarimuddada:Jimin13@cluster0.6cmgfwe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri);

/* multer upload folder */
const upload = multer({
    dest: "uploads/"
    });

    /* home route */
    app.get("/", (req,res)=>{
        res.send("Server working");
        });

        /* function to split text into chunks */
        function splitText(text, chunkSize = 1000, overlap = 200){

            let chunks = [];

                for(let i = 0; i < text.length; i += chunkSize - overlap){

                        chunks.push(text.substring(i, i + chunkSize));

                            }

                                return chunks;
                                }

                                /* upload route */
                                app.post("/upload", upload.single("pdf"), async (req,res)=>{

                                    try{

                                            /* read pdf file */
                                                    const filePath = req.file.path;

                                                            const dataBuffer = fs.readFileSync(filePath);

                                                                    const pdfData = await pdfParse(dataBuffer);

                                                                            const text = pdfData.text;

                                                                                    console.log("PDF text extracted");

                                                                                            /* split text */
                                                                                                    const chunks = splitText(text);

                                                                                                            console.log("Number of chunks:", chunks.length);

                                                                                                                    /* connect mongodb */
                                                                                                                            await client.connect();

                                                                                                                                    console.log("Connected to MongoDB");

                                                                                                                                            const db = client.db("sop_database");

                                                                                                                                                    const collection = db.collection("documents");

                                                                                                                                                            /* store each chunk */
                                                                                                                                                                    for(let chunk of chunks){

                                                                                                                                                                                await collection.insertOne({

                                                                                                                                                                                                filename: req.file.originalname,

                                                                                                                                                                                                                content: chunk,

                                                                                                                                                                                                                                createdAt: new Date()

                                                                                                                                                                                                                                            });

                                                                                                                                                                                                                                                    }

                                                                                                                                                                                                                                                            console.log("Chunks saved to MongoDB");

                                                                                                                                                                                                                                                                    res.send("PDF uploaded and chunked successfully");

                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                            catch(error){

                                                                                                                                                                                                                                                                                    console.log(error);

                                                                                                                                                                                                                                                                                            res.send("Error processing PDF");

                                                                                                                                                                                                                                                                                                }

                                                                                                                                                                                                                                                                                                });

                                                                                                                                                                                                                                                                                                /* start server */
                                                                                                                                                                                                                                                                                                app.listen(PORT, ()=>{

                                                                                                                                                                                                                                                                                                    console.log(`Server running on http://localhost:${PORT}`);

                                                                                                                                                                                                                                                                                                    });