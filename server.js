const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const upload = multer({
  dest: "uploads/"
});

let sopParagraphs = [];


/*
FUNCTION: Clean PDF text and convert into logical paragraphs
*/
function processPDFText(text) {

  // remove extra spaces
  text = text.replace(/\r/g, " ");

  // join broken lines
  text = text.replace(/\n+/g, "\n");

  // split paragraphs intelligently
  let paragraphs = text.split(/\n(?=\d+\.|\•|\-|\*)/);

  // fallback split if numbering not present
  if (paragraphs.length < 5) {

    paragraphs = text.split(/\n{2,}/);

  }

  // clean paragraphs
  paragraphs = paragraphs.map(p =>
    p.replace(/\n/g, " ")
     .replace(/\s+/g, " ")
     .trim()
  );

  return paragraphs.filter(p => p.length > 30);

}


/*
UPLOAD SOP PDF (DYNAMIC)
*/
app.post("/upload", upload.single("pdf"), async (req, res) => {

  try {

    const fileBuffer = fs.readFileSync(req.file.path);

    const pdfData = await pdfParse(fileBuffer);

    sopParagraphs = processPDFText(pdfData.text);

    res.json({
      message: "SOP uploaded successfully"
    });

  }
  catch (error) {

    res.status(500).json({
      message: "Error processing PDF"
    });

  }

});



/*
ASK QUESTION (SMART MATCHING)
*/
app.post("/ask", (req, res) => {

  try {

    const question = req.body.question.toLowerCase();

    if (!sopParagraphs.length) {

      return res.json({
        answer: "Please upload SOP PDF first"
      });

    }

    const keywords = question.split(" ");

    let scoredMatches = [];

    for (let para of sopParagraphs) {

      let score = 0;

      let p = para.toLowerCase();

      for (let word of keywords) {

        if (p.includes(word)) {

          score++;

        }

      }

      if (score > 0) {

        scoredMatches.push({
          text: para,
          score: score
        });

      }

    }

    if (scoredMatches.length === 0) {

      return res.json({
        answer: "Answer not found in SOP"
      });

    }

    // sort best matches
    scoredMatches.sort((a,b) => b.score - a.score);

    // return top 2 paragraphs
    let finalAnswer = scoredMatches
      .slice(0,2)
      .map(m => m.text)
      .join("\n\n");

    res.json({
      answer: finalAnswer
    });

  }
  catch (error) {

    res.status(500).json({
      answer: "Error processing request"
    });

  }

});


const PORT = 5000;

app.listen(PORT, () => {

  console.log("Server running on port " + PORT);

});
