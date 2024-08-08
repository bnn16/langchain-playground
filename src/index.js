import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";

const model = new ChatOpenAI({
  model: "gpt-3.5-turbo",
  openAIApiKey: "heheheheh",
  configuration: { dangerouslyAllowBrowser: true },
});
const parser = new StringOutputParser();

const prompt1 = PromptTemplate.fromTemplate(
  `You are tasked of creating process mining filters based on the user's input. The user has provided the following input: {userInput}. What kind of filters would suit the user best? al`,
);

const prompt2 = PromptTemplate.fromTemplate(
  `You are a Process Mining expert. You have been asked to create some kind of example data based on filters {filters}. Generate some example data that would suit the filters. Keep it short and simple. Return the data as a strings`,
);
const prompt3 = PromptTemplate.fromTemplate(
  `Based on the following filters {data}, can you try to explain the process that the data is trying to represent? And what kind of insights can you derive from the data? Also include the data that you have generated. Keep it short and simple.`,
);
const chain = prompt1.pipe(model).pipe(parser);
const chain2 = prompt2.pipe(model).pipe(parser);

const bonusPrompt = RunnableSequence.from([
  {
    data: new RunnablePassthrough(),
  },
  prompt3,
  model,
  new StringOutputParser(),
]);

const combinedChain = RunnableSequence.from([
  {
    filters: chain,
  },
  prompt2,
  model,
  parser,
  bonusPrompt,
]);

const body = document.querySelector("body");
body.addEventListener("click", (event) => {
  console.log("Body was clicked.");
});
const element = document.querySelector("form");
element.addEventListener("submit", (event) => {
  event.preventDefault();
  console.log("Form submission cancelled.");
});

function handleUserInput() {
  const chat = document.getElementById("chat-container");
  const userInput = document.getElementById("fmsg").value;
  const div = document.createElement("div");
  div.classList.add("usrMsg");
  div.style.height = "auto";
  div.style.width = "auto";
  div.style.minWidth = "50%";
  const label = document.createElement("label");
  label.id = "user-resp";
  label.innerHTML = userInput;
  div.appendChild(label);
  chat.appendChild(div);
  const br = document.createElement("br");
  chat.appendChild(br);

  return userInput;
}

function handleAiResponse() {
  const chat = document.getElementById("chat-container");
  const div = document.createElement("div");
  div.classList.add("aiMsg");
  const label = document.createElement("label");
  label.id = "ai-resp";
  div.appendChild(label);
  chat.appendChild(div);
  const br = document.createElement("br");
  chat.appendChild(br);
}

async function myFunction() {
  const userInput = handleUserInput();

  const stream = await combinedChain.stream({
    userInput: userInput,
  });

  handleAiResponse();
  const responseMsgAll = document.querySelectorAll("#ai-resp");
  console.log(responseMsgAll);
  const responseMsg = responseMsgAll[responseMsgAll.length - 1];
  responseMsg.innerHTML = "";
  for await (const chunk of stream) {
    const span = document.createElement("span");
    span.classList.add("slide-fade-in");
    span.textContent = chunk;
    responseMsg.appendChild(span);

    span.offsetWidth;
    span.classList.add("slide-fade-in");
  }
  console.log("done");
}

window.myFunction = myFunction;
