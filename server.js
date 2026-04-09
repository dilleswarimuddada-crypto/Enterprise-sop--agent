const express = require("express");
const multer = require("multer");
const fs = require("fs");
const pdf = require("pdf-parse");

const app = express();
const PORT = 3000;

/* allow html file */
app.use(express.static(__dirname));

/* storage location */
const storage = multer.diskStorage({

  destination: function (req, file, cb) {
      cb(null, "uploads/");
        },

          filename: function (req, file, cb) {
              cb(null, file.originalname);
                }

                });

                const upload = multer({ storage: storage });

                /* test route */
                app.get("/", (req, res) => {

                  res.send("Enterprise SOP Agent Server Running");

                  });

                  /* upload route + PDF reading + chunking */
                  app.post("/upload", upload.single("file"), async (req, res) => {

                    try {

                        if (!req.file) {
                              return res.send("No file uploaded");
                                  }

                                      const filePath = req.file.path;

                                          const dataBuffer = fs.readFileSync(filePath);

                                              const data = await pdf(dataBuffer);

                                                  const text = data.text;

                                                      const chunkSize = 500;

                                                          let chunks = [];

                                                              for (let i = 0; i < text.length; i += chunkSize) {

                                                                    chunks.push(text.substring(i, i + chunkSize));

                                                                        }

                                                                            console.log("===== TEXT CHUNKS =====");

                                                                                console.log(chunks);

                                                                                    res.send("PDF uploaded and text processed successfully");

                                                                                      }

                                                                                        catch (error) {

                                                                                            console.log(error);

                                                                                                res.send("Error reading PDF");

                                                                                                  }

                                                                                                  });

                                                                                                  /* start server */
                                                                                                  app.listen(PORT, () => {

                                                                                                    console.log("server running on port 3000");

                                                                                                    });