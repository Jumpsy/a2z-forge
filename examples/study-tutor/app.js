import { answerQuestion, createReviewQuestion, parseMaterial } from "./tutor-core.mjs";

const elements = Object.fromEntries([
  "source-file", "demo-source", "drop-zone", "source-error", "source-content", "source-name",
  "source-lines", "source-count", "replace-source", "empty-tutor", "active-tutor", "answer-status",
  "conversation", "question-form", "question", "new-review", "review-card",
].map((id) => [id, document.getElementById(id)]));

let sentences = [];
let reviewSeed = 0;

elements["source-file"].addEventListener("change", async (event) => {
  const [file] = event.target.files;
  if (file) await loadFile(file);
});
elements["demo-source"].addEventListener("click", async () => {
  setLoading("Loading example");
  try {
    const response = await fetch("./fixtures/biology.txt");
    if (!response.ok) throw new Error("The example source could not be loaded.");
    activateSource("biology-notes.txt", await response.text());
  } catch (error) { showError(error); }
});
elements["replace-source"].addEventListener("click", resetSource);
elements["question-form"].addEventListener("submit", (event) => {
  event.preventDefault();
  ask(elements.question.value);
});
elements["new-review"].addEventListener("click", () => renderReview(++reviewSeed));
document.querySelectorAll("[data-question]").forEach((button) => button.addEventListener("click", () => ask(button.dataset.question)));

for (const eventName of ["dragenter", "dragover"]) elements["drop-zone"].addEventListener(eventName, (event) => {
  event.preventDefault();
  elements["drop-zone"].classList.add("is-dragging");
});
for (const eventName of ["dragleave", "drop"]) elements["drop-zone"].addEventListener(eventName, (event) => {
  event.preventDefault();
  elements["drop-zone"].classList.remove("is-dragging");
});
elements["drop-zone"].addEventListener("drop", async (event) => {
  const [file] = event.dataTransfer.files;
  if (file) await loadFile(file);
});

async function loadFile(file) {
  if (file.size > 2 * 1024 * 1024) return showError(new Error("Choose a file smaller than 2 MB."));
  if (!/\.(txt|md)$/i.test(file.name) && !["text/plain", "text/markdown"].includes(file.type)) return showError(new Error("Choose a plain text or Markdown file."));
  setLoading("Reading source");
  try { activateSource(file.name, await file.text()); } catch (error) { showError(error); }
}

function activateSource(name, text) {
  sentences = parseMaterial(text);
  elements["source-error"].hidden = true;
  elements["drop-zone"].hidden = true;
  elements["source-content"].hidden = false;
  elements["source-name"].textContent = name;
  elements["source-count"].textContent = `${sentences.length} passages`;
  elements["source-lines"].replaceChildren(...sentences.map(({ id, text }) => {
    const item = document.createElement("li");
    item.id = `source-${id}`;
    item.textContent = text;
    return item;
  }));
  elements["empty-tutor"].hidden = true;
  elements["active-tutor"].hidden = false;
  elements["answer-status"].textContent = "Source ready";
  elements.conversation.replaceChildren();
  appendMessage("tutor", "Source loaded. Ask a specific question and I will answer with the closest passages.");
  renderReview(0);
  elements.question.focus();
}

function ask(rawQuestion) {
  const question = rawQuestion.trim();
  if (!question || !sentences.length) return;
  appendMessage("user", question);
  elements.question.value = "";
  elements["answer-status"].textContent = "Searching source";
  clearCitations();
  const result = answerQuestion(question, sentences);
  appendMessage("tutor", result.answer, result.citations);
  for (const citation of result.citations) document.getElementById(`source-${citation.id}`)?.classList.add("is-cited");
  elements["answer-status"].textContent = result.citations.length ? `${result.citations.length} source ${result.citations.length === 1 ? "passage" : "passages"}` : "No matching passage";
}

function appendMessage(role, text, citations = []) {
  const message = document.createElement("div");
  message.className = `message ${role}`;
  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  message.append(paragraph);
  if (citations.length) {
    const cite = document.createElement("cite");
    cite.textContent = citations.map(({ id }) => `Source ${id}`).join(" · ");
    message.append(cite);
  }
  elements.conversation.append(message);
  message.scrollIntoView({ block: "nearest", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}

function renderReview(seed) {
  const review = createReviewQuestion(sentences, seed);
  const prompt = document.createElement("p");
  prompt.textContent = review.mode === "blank" ? `Fill the blank: ${review.prompt}` : review.prompt;
  const input = document.createElement("input");
  input.type = "text";
  input.setAttribute("aria-label", "Review answer");
  const check = document.createElement("button");
  check.type = "button";
  check.className = "button secondary";
  check.textContent = "Check answer";
  const result = document.createElement("div");
  result.className = "review-result";
  result.setAttribute("aria-live", "polite");
  check.addEventListener("click", () => {
    const correct = input.value.trim().toLowerCase() === review.answer.toLowerCase();
    result.textContent = correct ? `Correct. This comes from source ${review.sourceId}.` : `Not yet. The source answer is "${review.answer}". Review source ${review.sourceId}.`;
  });
  elements["review-card"].replaceChildren(prompt, input, check, result);
}

function resetSource() {
  sentences = [];
  elements["source-file"].value = "";
  elements["source-content"].hidden = true;
  elements["drop-zone"].hidden = false;
  elements["source-count"].textContent = "No source";
  elements["empty-tutor"].hidden = false;
  elements["active-tutor"].hidden = true;
  elements["answer-status"].textContent = "Waiting for material";
}

function setLoading(label) { elements["answer-status"].textContent = label; elements["source-error"].hidden = true; }
function showError(error) { elements["source-error"].textContent = error instanceof Error ? error.message : String(error); elements["source-error"].hidden = false; elements["answer-status"].textContent = "Source failed"; }
function clearCitations() { document.querySelectorAll(".is-cited").forEach((element) => element.classList.remove("is-cited")); }
