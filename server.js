const express = require("express");
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = 3000;

/* allow html files to open */
app.use(express.static("."));

/* MongoDB connection */
const uri = "mongodb+srv://Dilleswarimuddada:Jimin13@cluster0.6cmgfwe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri);

/* upload folder setup */
const upload = multer({
    dest: "uploads/"
    });

    /* home route */
    app.get("/", (req,res)=>{
        res.send("Server working");
        });

        /* upload route */
        app.post("/upload", upload.single("pdf"), async (req, res) => {

            try {

                    const filePath = req.file.path;

                            const dataBuffer = fs.readFileSync(filePath);

                                    const pdfData = await pdfParse(dataBuffer);

                                            const text = pdfData.text;

                                                    console.log("===== PDF TEXT SAMPLE =====");

                                                            console.log(text.substring(0,300));

                                                                    /* connect mongodb */
                                                                            await client.connect();

                                                                                    console.log("Connected to MongoDB");

                                                                                            const db = client.db("sop_database");

                                                                                                    const collection = db.collection("documents");

                                                                                                            /* store data */
                                                                                                                    await collection.insertOne({

                                                                                                                                filename: req.file.originalname,

                                                                                                                                            content: text,

                                                                                                                                                        createdAt: new Date()

                                                                                                                                                                });

                                                                                                                                                                        console.log("Saved to MongoDB");

                                                                                                                                                                                res.send("PDF uploaded and stored in MongoDB");

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