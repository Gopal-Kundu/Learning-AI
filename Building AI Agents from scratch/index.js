import { callGemini } from "./gemini.js"
import readlineSync from "readline-sync"
function getSellingPrice(item) {
    if (item === "punjabi") return 600;
    if (item === "kurta") return 700;
    else return 300;
}


function getSystemPrompt() {
    let ans = `Think and Response in json format 
    Example:
    {prompt: Tell me amount of 10 punjabi & 5 kurti}
    You return {call: punjabi} and stop.
    and then i send you {amount : 600} this is price of 1st item in prompt: 1 punjabi,
    you then send return {call: kurta} and stop.
    and then i send you {amount : 700} this is price of 2nd item in prompt: 1 kurta,
    
    You then return {finalOutput: 9500, explaination: because 10x600 = 6000 and 5x700 = 3500 and sum of 9500} 

    Only return json, nothing else

    Input:
    ${JSON.stringify(message)} 
`;
    return ans;
}


let message = [];

let query = readlineSync.question("Enter command: ");
message.push({ prompt: query });

let SYSTEM_PROMPT = getSystemPrompt();

let output;
while (true) {
    output = await callGemini(SYSTEM_PROMPT);

    if (output.call) {
        let val = getSellingPrice(output.call);
        message.push({ amount: val });
        SYSTEM_PROMPT = getSystemPrompt();
    } else if (output.finalOutput) {
        console.log("Amount required: " + output.finalOutput);
        console.log("Explaination:" + output.explaination);
        break;
    } else {
        console.log("Invalid, Something went Wrong.");
        break;
    }
}