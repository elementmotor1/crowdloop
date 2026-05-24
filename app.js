const storageKey = "crowdloop-ai-native-demo";

const seed = {
  role: "member",
  threshold: 60,
  posts: [
    {
      id: "post-1",
      caption: "Testing a remix chain where creators can branch a video and the original keeps attribution.",
      style: "violet",
      likes: 12842,
      loops: 384,
    },
    {
      id: "post-2",
      caption: "Behind the scenes from a creator drop built with audience prompts and real-time edits.",
      style: "teal",
      likes: 8210,
      loops: 219,
    },
    {
      id: "post-3",
      caption: "A quick cut showing how polls become product decisions without burying the owner review.",
      style: "amber",
      likes: 6475,
      loops: 151,
    },
  ],
  proposals: [
    {
      id: "proposal-1",
      title: "Creator split experiments",
      detail: "Let creators test revenue splits for collaborative posts before locking a campaign.",
      yes: 77,
      no: 18,
      status: "polling",
      decision: "",
    },
    {
      id: "proposal-2",
      title: "AI caption consent",
      detail: "Ask before AI rewrites captions on posts that mention personal topics or community events.",
      yes: 41,
      no: 28,
      status: "polling",
      decision: "",
    },
    {
      id: "proposal-3",
      title: "Quiet launch channels",
      detail: "Give creators private pilot channels where early members can vote before a feature goes public.",
      yes: 88,
      no: 8,
      status: "accepted",
      decision: "Approved for the next creator beta.",
    },
  ],
};

let state = loadState();

const views = document.querySelectorAll("[data-view]");
const viewLinks = document.querySelectorAll("[data-view-link]");
const viewTitle = document.querySelector("#view-title");
const postGrid = document.querySelector("#post-grid");
const proposalList = document.querySelector("#proposal-list");
const reviewList = document.querySelector("#review-list");
const roleSelect = document.querySelector("#role-select");
const thresholdRange = document.querySelector("#threshold-range");
const thresholdOutput = document.querySelector("#threshold-output");
const suggestionDialog = document.querySelector("#suggestion-dialog");

const titles = {
  feed: "Creator feed",
  proposals: "Community proposals",
  review: "Owner review",
};

function loadState() {
  const stored = localStorage.getItem(storageKey);
  if (!stored) return structuredClone(seed);

  try {
    return { ...structuredClone(seed), ...JSON.parse(stored) };
  } catch {
    return structuredClone(seed);
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function score(proposal) {
  const total = proposal.yes + proposal.no;
  return total ? Math.round((proposal.yes / total) * 100) : 0;
}

function compactNumber(value) {
  return Intl.NumberFormat("en", { notation: "compact" }).format(value);
}

function setView(name) {
  views.forEach((view) => view.classList.toggle("active", view.dataset.view === name));
  viewLinks.forEach((link) => link.classList.toggle("active", link.dataset.viewLink === name));
  viewTitle.textContent = titles[name];
  location.hash = name;
}

function renderPosts() {
  postGrid.innerHTML = state.posts
    .map(
      (post) => `
        <article class="post-card">
          <div class="post-media ${post.style}">
            <span>${post.caption.split(" ").slice(0, 4).join(" ")}</span>
          </div>
          <div class="post-body">
            <p>${escapeHtml(post.caption)}</p>
            <div class="post-actions">
              <button class="metric-button" data-like="${post.id}">${compactNumber(post.likes)}</button>
              <button class="metric-button" data-loop="${post.id}">${compactNumber(post.loops)}</button>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function renderProposals() {
  const proposals = [...state.proposals].sort((a, b) => score(b) - score(a));
  proposalList.innerHTML =
    proposals
      .map((proposal) => {
        const currentScore = score(proposal);
        const ready = currentScore >= state.threshold && proposal.status === "polling";
        return `
          <article class="proposal-card decision ${proposal.status}">
            <div class="panel-header">
              <h3>${escapeHtml(proposal.title)}</h3>
              <span class="tag">${ready ? "ready" : proposal.status}</span>
            </div>
            <p>${escapeHtml(proposal.detail)}</p>
            <div class="poll-bar" aria-label="${currentScore}% support">
              <div class="poll-fill" style="--score: ${currentScore}%"></div>
            </div>
            <div class="poll-meta">
              <span>${currentScore}% support</span>
              <span>${proposal.yes + proposal.no} votes</span>
            </div>
            <div class="proposal-actions">
              <button class="metric-button" data-vote-yes="${proposal.id}">Yes ${proposal.yes}</button>
              <button class="metric-button" data-vote-no="${proposal.id}">No ${proposal.no}</button>
            </div>
          </article>
        `;
      })
      .join("") || `<div class="empty-state">No proposals yet.</div>`;
}

function renderReview() {
  const ownerMode = state.role === "owner";
  const reviewable = state.proposals.filter((proposal) => proposal.status === "polling" && score(proposal) >= state.threshold);
  const decided = state.proposals.filter((proposal) => proposal.status !== "polling");
  const cards = [...reviewable, ...decided];

  reviewList.innerHTML =
    cards
      .map((proposal) => {
        const currentScore = score(proposal);
        const decisionText = proposal.decision ? `<p>${escapeHtml(proposal.decision)}</p>` : "";
        const actions =
          ownerMode && proposal.status === "polling"
            ? `<div class="decision-actions">
                <button class="primary-button" data-accept="${proposal.id}">Approve</button>
                <button class="secondary-button" data-reject="${proposal.id}">Decline</button>
              </div>`
            : "";

        return `
          <article class="review-card decision ${proposal.status}">
            <div class="panel-header">
              <h3>${escapeHtml(proposal.title)}</h3>
              <span class="tag">${proposal.status === "polling" ? `${currentScore}%` : proposal.status}</span>
            </div>
            <p>${escapeHtml(proposal.detail)}</p>
            ${decisionText}
            ${actions}
          </article>
        `;
      })
      .join("") || `<div class="empty-state">No proposal has crossed the poll threshold.</div>`;
}

function render() {
  roleSelect.value = state.role;
  thresholdRange.value = state.threshold;
  thresholdOutput.textContent = `${state.threshold}%`;
  renderPosts();
  renderProposals();
  renderReview();
  saveState();
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return entities[char];
  });
}

function aiPolishPost(text) {
  const base = text.trim() || "New creator update";
  return `${base.replace(/[.!?]*$/, "")}. Built with community prompts and tuned for remixable short-form discovery.`;
}

function aiRefineProposal(title, detail) {
  const cleanTitle = title.trim() || "Untitled feature";
  const cleanDetail = detail.trim() || "Members should vote on the value, creator impact, and moderation tradeoff.";
  return {
    title: cleanTitle.replace(/\s+/g, " ").replace(/^./, (letter) => letter.toUpperCase()),
    detail: `${cleanDetail.replace(/[.!?]*$/, "")}. Success means clear creator value, measurable adoption, and owner approval after polling.`,
  };
}

document.querySelector("#post-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const caption = document.querySelector("#post-caption").value.trim();
  const style = new FormData(event.currentTarget).get("mediaStyle");
  if (!caption) return;

  state.posts.unshift({
    id: crypto.randomUUID(),
    caption,
    style,
    likes: Math.floor(Math.random() * 3000) + 300,
    loops: Math.floor(Math.random() * 90) + 15,
  });
  event.currentTarget.reset();
  render();
});

document.querySelector("#polish-post").addEventListener("click", () => {
  const caption = document.querySelector("#post-caption");
  caption.value = aiPolishPost(caption.value).slice(0, 160);
});

document.querySelector("#proposal-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const title = document.querySelector("#proposal-title").value.trim();
  const detail = document.querySelector("#proposal-detail").value.trim();
  if (!title || !detail) return;

  state.proposals.unshift({
    id: crypto.randomUUID(),
    title,
    detail,
    yes: 1,
    no: 0,
    status: "polling",
    decision: "",
  });
  event.currentTarget.reset();
  render();
});

document.querySelector("#refine-proposal").addEventListener("click", () => {
  const title = document.querySelector("#proposal-title");
  const detail = document.querySelector("#proposal-detail");
  const refined = aiRefineProposal(title.value, detail.value);
  title.value = refined.title.slice(0, 72);
  detail.value = refined.detail.slice(0, 260);
});

document.addEventListener("click", (event) => {
  const target = event.target.closest("button, a");
  if (!target) return;

  const viewName = target.dataset.viewLink;
  if (viewName) {
    event.preventDefault();
    setView(viewName);
    return;
  }

  mutateByDataset(target);
});

function mutateByDataset(target) {
  const likeId = target.dataset.like;
  const loopId = target.dataset.loop;
  const yesId = target.dataset.voteYes;
  const noId = target.dataset.voteNo;
  const acceptId = target.dataset.accept;
  const rejectId = target.dataset.reject;

  if (likeId) updatePost(likeId, (post) => post.likes++);
  if (loopId) updatePost(loopId, (post) => post.loops++);
  if (yesId) updateProposal(yesId, (proposal) => proposal.yes++);
  if (noId) updateProposal(noId, (proposal) => proposal.no++);
  if (acceptId) {
    updateProposal(acceptId, (proposal) => {
      proposal.status = "accepted";
      proposal.decision = "Approved by owner after community polling.";
    });
  }
  if (rejectId) {
    updateProposal(rejectId, (proposal) => {
      proposal.status = "rejected";
      proposal.decision = "Declined by owner after review.";
    });
  }
}

function updatePost(id, updater) {
  const post = state.posts.find((item) => item.id === id);
  if (post) {
    updater(post);
    render();
  }
}

function updateProposal(id, updater) {
  const proposal = state.proposals.find((item) => item.id === id);
  if (proposal) {
    updater(proposal);
    render();
  }
}

roleSelect.addEventListener("change", (event) => {
  state.role = event.target.value;
  render();
});

thresholdRange.addEventListener("input", (event) => {
  state.threshold = Number(event.target.value);
  render();
});

document.querySelector("#open-suggestion").addEventListener("click", () => {
  suggestionDialog.showModal();
});

suggestionDialog.addEventListener("close", () => {
  if (suggestionDialog.returnValue === "proposals") {
    setView("proposals");
    document.querySelector("#proposal-title").focus();
  }
});

document.querySelector("#reset-demo").addEventListener("click", () => {
  state = structuredClone(seed);
  render();
});

const initialView = location.hash.replace("#", "") || "feed";
setView(titles[initialView] ? initialView : "feed");
render();
