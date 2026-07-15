const stateUrl = new URL("./project-state.json", import.meta.url);

loadDashboard().catch((error) => {
  console.error(error);
  document.getElementById("load-error").hidden = false;
  document.getElementById("data-label").textContent = "State unavailable";
});

async function loadDashboard() {
  const response = await fetch(stateUrl);
  if (!response.ok) throw new Error(`State request failed: ${response.status}`);
  const state = await response.json();
  validateState(state);
  renderHeader(state);
  renderTasks(state.tasks);
  renderAgents(state.agents);
  renderEvidence(state.evidence);
  renderUsage(state.usage, state.qualityHistory ?? []);
  renderRelease(state.findings);
}

function validateState(state) {
  for (const key of ["productName", "idea", "milestone", "permissionMode", "updatedAt", "tasks", "agents", "findings", "evidence", "usage"]) {
    if (!(key in state)) throw new Error(`Project state is missing ${key}`);
  }
  if (!Array.isArray(state.tasks) || !Array.isArray(state.evidence)) throw new Error("Project tasks and evidence must be arrays");
}

function renderHeader(state) {
  text("data-label", state.demo ? "Demo data, not a release claim" : "Live project state");
  text("project-name", state.productName);
  text("checkpoint", `Event ${state.lastJournalSequence ?? 0}`);
  text("mission-title", state.goal);
  text("project-idea", state.idea);
  text("milestone", state.milestone);
  text("permission-mode", state.permissionMode);
  text("updated-at", `Updated ${new Date(state.updatedAt).toLocaleString()}`);
}

function renderTasks(tasks) {
  const list = document.getElementById("task-list");
  const nodes = tasks.map((task, index) => {
    const node = document.createElement("button");
    node.className = "task-node";
    node.type = "button";
    node.dataset.status = task.status;
    node.dataset.index = String(index);
    node.setAttribute("role", "listitem");
    node.setAttribute("aria-label", `${task.title}. ${task.status}.`);
    node.tabIndex = index === 0 ? 0 : -1;
    const dependencies = task.dependencies?.length ? `After ${task.dependencies.join(", ")}` : "Entry task";
    node.innerHTML = `<small>${escapeHtml(task.status)}</small><strong>${escapeHtml(task.title)}</strong><span>${escapeHtml(dependencies)}</span>`;
    node.addEventListener("click", () => selectTask(task, node));
    node.addEventListener("keydown", (event) => moveTaskFocus(event, nodes));
    list.append(node);
    return node;
  });
  if (tasks[0] && nodes[0]) selectTask(tasks[0], nodes[0]);
}

function selectTask(task, node) {
  document.querySelectorAll(".task-node").forEach((candidate) => candidate.setAttribute("aria-current", String(candidate === node)));
  text("detail-title", task.title);
  text("detail-objective", task.objective);
  text("detail-status", task.status);
  text("detail-owner", task.owner ?? "Unassigned");
  text("detail-risk", task.risk);
  text("detail-usage", `${task.actualUsage ?? 0} / ${task.estimatedUsage ?? 0} estimated units`);
  text("detail-resume", task.resumeInstructions ?? "Inspect the latest task event.");
  const acceptance = document.getElementById("detail-acceptance");
  acceptance.replaceChildren(...(task.acceptanceCriteria ?? []).map((criterion) => element("li", criterion)));
}

function moveTaskFocus(event, nodes) {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  const current = Number(event.currentTarget.dataset.index);
  const target = event.key === "Home" ? 0 : event.key === "End" ? nodes.length - 1 : event.key === "ArrowRight" ? Math.min(nodes.length - 1, current + 1) : Math.max(0, current - 1);
  nodes.forEach((node, index) => { node.tabIndex = index === target ? 0 : -1; });
  nodes[target]?.focus();
}

function renderAgents(agents) {
  const active = agents.filter(({ status }) => status === "working");
  text("agent-count", `${active.length} active`);
  const list = document.getElementById("agent-list");
  if (!agents.length) { list.append(element("p", "No active agent leases.", "empty-copy")); return; }
  list.replaceChildren(...agents.map((agent) => {
    const row = element("div", "", "agent-row");
    row.dataset.status = agent.status;
    row.innerHTML = `<i aria-hidden="true"></i><strong>${escapeHtml(agent.id)}</strong><span>${escapeHtml(agent.status)} · ${escapeHtml(agent.taskId ?? "no task")}</span>`;
    return row;
  }));
}

function renderEvidence(evidence) {
  text("evidence-count", `${evidence.length} records`);
  const list = document.getElementById("evidence-list");
  if (!evidence.length) { list.append(element("li", "No evidence recorded.")); return; }
  list.replaceChildren(...evidence.map((record, index) => {
    const item = document.createElement("li");
    item.innerHTML = `<b>${String(index + 1).padStart(2, "0")}</b><div><p>${escapeHtml(record.summary)}</p><span>${escapeHtml(record.kind)} · confidence ${Math.round(record.confidence * 100)}% · ${escapeHtml(record.source)}</span></div>`;
    return item;
  }));
}

function renderUsage(usage, qualityHistory) {
  const total = usage.estimatedTokens + usage.observedTokens;
  const planningCeiling = Math.max(total, 20_000);
  const usedPercent = Math.min(100, total / planningCeiling * 100);
  document.getElementById("usage-fill").style.width = `${usedPercent}%`;
  document.getElementById("reserve-marker").style.left = `${100 - usage.reservePercent}%`;
  text("usage-copy", `${formatNumber(total)} token units recorded or estimated. ${usage.reservePercent}% reserve configured. No provider quota is inferred.`);
  const points = qualityHistory.map((value, index) => `${index * (320 / Math.max(1, qualityHistory.length - 1))},${86 - value * .78}`).join(" ");
  document.getElementById("quality-line").setAttribute("points", points);
  text("quality-desc", qualityHistory.length ? `Demo scores: ${qualityHistory.join(", ")}.` : "No quality history recorded.");
}

function renderRelease(findings) {
  const blockers = findings.filter((finding) => finding.blocksRelease && finding.status === "open");
  const gate = document.querySelector(".release-gate");
  gate.classList.add(blockers.length ? "is-blocked" : "is-ready");
  text("release-status", blockers.length ? "Blocked" : "Candidate");
  text("gate-title", blockers.length ? "Release blocked" : "No recorded release blocker");
  text("gate-copy", blockers.length ? "Evidence-backed blockers must close before publication." : "This status reflects recorded findings only. Required checks still need evidence.");
  const list = document.getElementById("blocking-list");
  list.replaceChildren(...(blockers.length ? blockers.map((finding) => element("li", `${finding.id}: ${finding.defect}`)) : [element("li", "No open blocking finding in this state snapshot.")]));
}

function text(id, value) { document.getElementById(id).textContent = String(value); }
function element(tag, content, className = "") { const node = document.createElement(tag); node.textContent = content; if (className) node.className = className; return node; }
function escapeHtml(value) { return String(value).replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]); }
function formatNumber(value) { return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value); }
