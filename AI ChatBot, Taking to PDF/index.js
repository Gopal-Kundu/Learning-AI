import fs from "fs";
import { PDFParse } from "pdf-parse";
import { getEmbeddings } from "./Gemini/gemini.js";
import { makeChunks } from "./Gemini/gemini.js";
import { callGemini } from "./Gemini/gemini.js";
import readlineSync from "readline-sync"
import { index } from "./pinecone.js";

const dataBuffer = fs.readFileSync("./JavaScript_Notes_for_Professionals.pdf");
const uint8Array = new Uint8Array(dataBuffer);
const pdf = new PDFParse({ data: uint8Array });
const result = await pdf.getText();
console.log("Reached Here: 1");
const chunks = makeChunks(result.text, 1000);
console.log("Reached Here: 2");

let records = [], count = 0;
for (let i = 0; i < chunks.length; i++) {
    const embedding = await getEmbeddings(chunks[i]); //Taking 368 dimension
    records.push(
        {
            id: `chunk-${i}`,
            values: embedding,
            metadata: {
                text: chunks[i],
            },
        }
    );
    if(records.length == 20) break;
    if (records.length == 100) {
        await index.upsert({ records }); //Sending chunks and vectors to pipecone DB
        records = [];
        count += records.length;
        console.log("Embedding uploaded: ", count);
    }
    console.log("Embeddig processing: ",i);
}

if (records.length > 0) {
    await index.upsert({ records }); //Sending remaining chunks and vectors to pipecone DB
    records = [];
    count += records.length;
    console.log("Embedding uploaded: ", count);
}
console.log("All Embeddings uploaded");

while (true) {
    let query = readlineSync.question("Tell me what you want to know: ");
    const questionEmbedding = await getEmbeddings(query); //Embedding user query.

    const result = await index.query({
        vector: questionEmbedding,
        topK: 5,
        includeMetadata: true,
    }); //Returning top 5 closest related chunks.

    const context = result.matches.map(
        match => match.metadata.text
    ).join("\n"); //Combining those chunks


    //Sending those chunks and question to gemini
    const finalPrompt = ` Answer using only this PDF data: ${context} if no context found say "Not found in PDF"
    Question: ${query}`;

    const answer = await callGemini(finalPrompt);
    console.log(answer);
}