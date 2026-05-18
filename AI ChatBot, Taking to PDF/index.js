import fs from "fs";
import { PDFParse } from "pdf-parse";
import { getEmbeddings } from "./Gemini/gemini.js";
import { makeChunks } from "./Gemini/gemini.js";
import { callGemini } from "./Gemini/gemini.js";
import readlineSync from "readline-sync"

const dataBuffer = fs.readFileSync("./JavaScript_Notes_for_Professionals.pdf");
const uint8Array = new Uint8Array(dataBuffer);
const pdf = new PDFParse({ data: uint8Array });
const result = await pdf.getText();

// makeChunks(resuult.text, 1000);

while(true){
    let query = readlineSync.question("Tell me want you want to know: ");
    console.log(await callGemini(query + result.text));
}