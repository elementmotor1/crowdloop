const storageKey = "crowdloop-social-v2";

const navItems = [
  { id: "home", label: "Home", icon: "M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3Z" },
  { id: "reels", label: "Reels", icon: "M8 3h8l4 6v12H4V9Z M8 3l4 6m4-6-4 6" },
  { id: "create", label: "Create", icon: "M12 5v14M5 12h14" },
  { id: "proposals", label: "Polls", icon: "M5 5h14v9H8l-3 3V5Z" },
  { id: "inbox", label: "Inbox", icon: "M4 5h16v14H4Z M4 7l8 6 8-6" },
  { id: "profile", label: "Profile", icon: "M20 21a8 8 0 0 0-16 0M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" },
];

const seed = {
  currentView: "home",
  activeProfile: "me",
  role: "member",
  threshold: 60,
  creators: [
    { id: "me", name: "You", handle: "you", bio: "Building in public with community-led product loops.", following: true, followers: 1240 },
    { id: "nova", name: "Nova Park", handle: "novapark", bio: "Short-form experiments, AI edits, and creator economics.", following: true, followers: 48200 },
    { id: "kai", name: "Kai Stone", handle: "kaistone", bio: "Daily motion studies and launch breakdowns.", following: false, followers: 19600 },
    { id: "mira", name: "Mira Lane", handle: "miralane", bio: "Community strategy for independent creators.", following: false, followers: 30500 },
  ],
  posts: [
    {
      id: "post-1",
      creatorId: "nova",
      type: "video",
      style: "pulse",
      media: "assets/social-ai-visual.png",
      caption: "Testing a remix chain where creators can branch a video and the original keeps attribution.",
      audio: "Original audio - product loop",
      likes: 12842,
      shares: 631,
      saves: 2204,
      liked: false,
      saved: false,
      comments: [
        { user: "mira", text: "This should become the default collab flow." },
        { user: "you", text: "Attribution plus voting feels right." },
      ],
    },
    {
      id: "post-2",
      creatorId: "kai",
      type: "video",
      style: "aqua",
      caption: "Behind the scenes from a creator drop built with audience prompts and real-time edits.",
      audio: "Studio notes",
      likes: 8210,
      shares: 214,
      saves: 980,
      liked: false,
      saved: true,
      comments: [{ user: "nova", text: "The edit history should stay visible." }],
    },
    {
      id: "post-3",
      creatorId: "mira",
      type: "photo",
      style: "sunset",
      caption: "A product council format where the community proposes, votes, and the owner makes the final call.",
      audio: "Strategy notes",
      likes: 6475,
      shares: 151,
      saves: 1201,
      liked: true,
      saved: false,
      comments: [{ user: "kai", text: "This is how platform roadmaps should feel." }],
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
  activity: [
    { id: "a1", actor: "nova", text: "liked your launch poll", time: "2m" },
    { id: "a2", actor: "mira", text: "commented on remix attribution", time: "18m" },
    { id: "a3", actor: "kai", text: "started following you", time: "1h" },
  ],
  messages: [
    { id: "m1", from: "nova", text: "Can we test creator branches on tomorrow's drop?", time: "9:42 AM" },
    { id: "m2", from: "mira", text: "The owner review queue needs status notes.", time: "Yesterday" },
  ],
};

let state = loadState();

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const desktopNav = $("#desktop-nav");
const mobileNav = $("#mobile-nav");
const roleSelect = $("#role-select");
const thresholdRange = $("#threshold-range");
const thresholdOutput = $("#threshold-output");
const searchInput = $("#search-input");

function loadState() {
  const stored = localStorage.getItem(storageKey);
  if (!stored) return structuredClone(seed);
  try {
    const parsed = JSON.parse(stored);
    return { ...structuredClone(seed), ...parsed };
  } catch {
    return structuredClone(seed);
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function icon(path) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}" /></svg>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

function compact(value) {
  return Intl.NumberFormat("en", { notation: "compact" }).format(value);
}

function creator(id) {
  return state.creators.find((item) => item.id === id) || state.creators[0];
}

function initials(person) {
  return person.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function score(proposal) {
  const total = proposal.yes + proposal.no;
  return total ? Math.round((proposal.yes / total) * 100) : 0;
}

function renderNav() {
  const links = navItems
    .map(
      (item) => `
        <a class="nav-link ${state.currentView === item.id ? "active" : ""}" href="#${item.id}" data-route="${item.id}">
          ${icon(item.icon)}
          <span>${item.label}</span>
        </a>
      `
    )
    .join("");
  desktopNav.innerHTML = `${links}<a class="nav-link ${state.currentView === "review" ? "active" : ""}" href="#review" data-route="review">${icon("M6 3h9l3 3v15H6Z M9 13h6M9 17h6M9 9h3")}<span>Review</span></a>`;
  mobileNav.innerHTML = links;
}

function setView(view) {
  const allowed = [...navItems.map((item) => item.id), "review"];
  state.currentView = allowed.includes(view) ? view : "home";
  $$(".view").forEach((node) => node.classList.toggle("active", node.dataset.view === state.currentView));
  renderNav();
  location.hash = state.currentView;
  saveState();
}

function matchesSearch(text) {
  const term = searchInput.value.trim().toLowerCase();
  return !term || text.toLowerCase().includes(term);
}

function renderStories() {
  $("#stories").innerHTML = state.creators
    .map(
      (person) => `
        <button class="story" data-profile="${person.id}" type="button">
          <span class="story-avatar">${initials(person)}</span>
          <span>${escapeHtml(person.name.split(" ")[0])}</span>
        </button>
      `
    )
    .join("");
}

function renderCreatorButton(person) {
  return `
    <button class="creator-button" data-profile="${person.id}" type="button">
      <span class="avatar">${initials(person)}</span>
      <span><strong>${escapeHtml(person.name)}</strong><span>@${escapeHtml(person.handle)}</span></span>
    </button>
  `;
}

function renderMedia(post, compactMode = false) {
  const person = creator(post.creatorId);
  const mediaImage = post.media ? `<img src="${post.media}" alt="" />` : "";
  return `
    <div class="media ${post.style}">
      ${mediaImage}
      <div class="media-content">
        <span>${post.type === "video" ? "Short video" : "Photo"}</span>
        <strong>${escapeHtml(compactMode ? person.name : post.caption.split(" ").slice(0, 8).join(" "))}</strong>
      </div>
    </div>
  `;
}

function renderFeed() {
  const filtered = state.posts.filter((post) => matchesSearch(`${post.caption} ${creator(post.creatorId).name} ${creator(post.creatorId).handle}`));
  $("#feed-list").innerHTML =
    filtered
      .map((post) => {
        const person = creator(post.creatorId);
        return `
          <article class="post-card" data-post-card="${post.id}">
            <header class="post-head">
              ${renderCreatorButton(person)}
              <button class="secondary-button" data-follow="${person.id}" type="button">${person.following ? "Following" : "Follow"}</button>
            </header>
            ${renderMedia(post)}
            <div class="post-body">
              <div class="action-row">
                <button class="action-button" data-like="${post.id}" type="button">${post.liked ? "Liked" : "Like"} ${compact(post.likes)}</button>
                <button class="action-button" data-save="${post.id}" type="button">${post.saved ? "Saved" : "Save"} ${compact(post.saves)}</button>
                <button class="action-button" data-share="${post.id}" type="button">Share ${compact(post.shares)}</button>
              </div>
              <p class="post-caption"><strong>${escapeHtml(person.handle)}</strong> ${escapeHtml(post.caption)}</p>
              <p class="muted">${escapeHtml(post.audio)}</p>
              <div class="comments">${post.comments.slice(-2).map((comment) => `<p class="comment-row"><strong>${escapeHtml(comment.user)}</strong> ${escapeHtml(comment.text)}</p>`).join("")}</div>
              <form class="comment-form" data-comment-form="${post.id}">
                <input name="comment" maxlength="120" placeholder="Add a comment" />
                <button class="secondary-button" type="submit">Post</button>
              </form>
            </div>
          </article>
        `;
      })
      .join("") || `<div class="empty-state">No posts match that search.</div>`;
}

function renderSuggestedCreators() {
  $("#suggested-creators").innerHTML = `
    <div class="panel-heading"><h2>Suggested creators</h2><span class="pill">for you</span></div>
    ${state.creators
      .filter((person) => person.id !== "me")
      .map(
        (person) => `
          <div class="creator-suggestion">
            ${renderCreatorButton(person)}
            <button class="secondary-button" data-follow="${person.id}" type="button">${person.following ? "Following" : "Follow"}</button>
          </div>
        `
      )
      .join("")}
  `;
}

function renderReels() {
  $("#reels-list").innerHTML = state.posts
    .filter((post) => post.type === "video")
    .map((post) => {
      const person = creator(post.creatorId);
      return `
        <article class="reel ${post.style}">
          <div class="reel-main">
            ${renderCreatorButton(person)}
            <h1>${escapeHtml(post.caption)}</h1>
            <p>${escapeHtml(post.audio)}</p>
          </div>
          <div class="reel-actions">
            <button class="action-button" data-like="${post.id}" type="button">${post.liked ? "Y" : "L"}</button>
            <button class="action-button" data-save="${post.id}" type="button">S</button>
            <button class="action-button" data-share="${post.id}" type="button">A</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderProposals() {
  const proposals = [...state.proposals].sort((a, b) => score(b) - score(a));
  $("#proposal-list").innerHTML =
    proposals
      .map((proposal) => {
        const currentScore = score(proposal);
        const ready = proposal.status === "polling" && currentScore >= state.threshold;
        return `
          <article class="proposal-card">
            <div class="panel-heading">
              <h3>${escapeHtml(proposal.title)}</h3>
              <span class="pill">${ready ? "ready" : proposal.status}</span>
            </div>
            <p class="muted">${escapeHtml(proposal.detail)}</p>
            <div class="poll-bar"><div class="poll-fill" style="--score:${currentScore}%"></div></div>
            <div class="poll-meta"><span>${currentScore}% support</span><span>${proposal.yes + proposal.no} votes</span></div>
            <div class="action-row">
              <button class="action-button" data-vote-yes="${proposal.id}" type="button">Yes ${proposal.yes}</button>
              <button class="action-button" data-vote-no="${proposal.id}" type="button">No ${proposal.no}</button>
            </div>
          </article>
        `;
      })
      .join("");
}

function renderReview() {
  thresholdRange.value = state.threshold;
  thresholdOutput.textContent = `${state.threshold}%`;
  const ownerMode = state.role === "owner";
  const cards = state.proposals.filter((proposal) => proposal.status !== "polling" || score(proposal) >= state.threshold);
  $("#review-list").innerHTML =
    cards
      .map((proposal) => {
        const actions =
          ownerMode && proposal.status === "polling"
            ? `<div class="action-row"><button class="primary-button" data-accept="${proposal.id}" type="button">Approve</button><button class="secondary-button" data-reject="${proposal.id}" type="button">Decline</button></div>`
            : "";
        return `
          <article class="review-card">
            <div class="panel-heading"><h3>${escapeHtml(proposal.title)}</h3><span class="pill">${proposal.status === "polling" ? `${score(proposal)}%` : proposal.status}</span></div>
            <p class="muted">${escapeHtml(proposal.detail)}</p>
            ${proposal.decision ? `<p>${escapeHtml(proposal.decision)}</p>` : ""}
            ${actions}
          </article>
        `;
      })
      .join("") || `<div class="empty-state">No proposal has crossed the poll threshold yet.</div>`;
}

function renderInbox() {
  $("#activity-count").textContent = String(state.activity.length);
  $("#activity-list").innerHTML = state.activity
    .map((item) => `<div class="activity-row"><span class="avatar">${initials(creator(item.actor))}</span><p><strong>@${escapeHtml(item.actor)}</strong> ${escapeHtml(item.text)} <span class="muted">${escapeHtml(item.time)}</span></p></div>`)
    .join("");
  $("#message-list").innerHTML = state.messages
    .map((item) => `<div class="message-row"><span class="avatar">${initials(creator(item.from))}</span><p><strong>@${escapeHtml(item.from)}</strong><br /><span class="muted">${escapeHtml(item.text)} - ${escapeHtml(item.time)}</span></p></div>`)
    .join("");
}

function renderProfile() {
  const person = creator(state.activeProfile);
  const posts = state.posts.filter((post) => post.creatorId === person.id);
  $("#profile-header").innerHTML = `
    <div class="profile-avatar">${initials(person)}</div>
    <div>
      <h1>${escapeHtml(person.name)}</h1>
      <p class="muted">@${escapeHtml(person.handle)}</p>
      <p>${escapeHtml(person.bio)}</p>
      <div class="profile-stats">
        <span>${posts.length} posts</span>
        <span>${compact(person.followers)} followers</span>
        <span>${person.following ? "Following" : "Not following"}</span>
      </div>
    </div>
    <button class="${person.id === "me" ? "secondary-button" : "primary-button"}" data-follow="${person.id}" type="button">${person.id === "me" ? "Edit profile" : person.following ? "Following" : "Follow"}</button>
  `;
  $("#profile-grid").innerHTML =
    posts.map((post) => `<button class="profile-tile ${post.style}" data-route="home" type="button">${escapeHtml(post.caption.split(" ").slice(0, 4).join(" "))}</button>`).join("") ||
    `<div class="empty-state">No posts yet.</div>`;
}

function renderCreatePreview() {
  const type = $("#post-type").value;
  const caption = $("#post-caption").value.trim() || "Your new post preview appears here.";
  const style = new FormData($("#create-post-form")).get("mediaStyle") || "pulse";
  $("#preview-media").className = `preview-media ${style}`;
  $("#preview-type").textContent = type === "video" ? "Short video" : "Photo carousel";
  $("#preview-caption").textContent = caption;
}

function renderAll() {
  roleSelect.value = state.role;
  renderNav();
  renderStories();
  renderFeed();
  renderSuggestedCreators();
  renderReels();
  renderProposals();
  renderReview();
  renderInbox();
  renderProfile();
  renderCreatePreview();
  saveState();
}

function addActivity(actor, text) {
  state.activity.unshift({ id: crypto.randomUUID(), actor, text, time: "now" });
  state.activity = state.activity.slice(0, 12);
}

function updatePost(id, updater) {
  const post = state.posts.find((item) => item.id === id);
  if (!post) return;
  updater(post);
  renderAll();
}

function updateProposal(id, updater) {
  const proposal = state.proposals.find((item) => item.id === id);
  if (!proposal) return;
  updater(proposal);
  renderAll();
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("button, a");
  if (!target) return;

  const route = target.dataset.route;
  if (route) {
    event.preventDefault();
    setView(route);
    renderAll();
    return;
  }

  if (target.dataset.profile) {
    state.activeProfile = target.dataset.profile;
    setView("profile");
    renderAll();
    return;
  }

  if (target.dataset.follow) {
    const person = creator(target.dataset.follow);
    if (person.id !== "me") {
      person.following = !person.following;
      person.followers += person.following ? 1 : -1;
      addActivity(person.id, person.following ? "followed back" : "updated follow status");
      renderAll();
    }
  }

  if (target.dataset.like) updatePost(target.dataset.like, (post) => { post.liked = !post.liked; post.likes += post.liked ? 1 : -1; });
  if (target.dataset.save) updatePost(target.dataset.save, (post) => { post.saved = !post.saved; post.saves += post.saved ? 1 : -1; });
  if (target.dataset.share) updatePost(target.dataset.share, (post) => { post.shares += 1; addActivity(creator(post.creatorId).id, "shared a post"); });
  if (target.dataset.voteYes) updateProposal(target.dataset.voteYes, (proposal) => { proposal.yes += 1; addActivity("me", `voted yes on ${proposal.title}`); });
  if (target.dataset.voteNo) updateProposal(target.dataset.voteNo, (proposal) => { proposal.no += 1; addActivity("me", `voted no on ${proposal.title}`); });
  if (target.dataset.accept) updateProposal(target.dataset.accept, (proposal) => { proposal.status = "accepted"; proposal.decision = "Approved by owner after community polling."; });
  if (target.dataset.reject) updateProposal(target.dataset.reject, (proposal) => { proposal.status = "rejected"; proposal.decision = "Declined by owner after review."; });
});

document.addEventListener("submit", (event) => {
  const commentForm = event.target.closest("[data-comment-form]");
  if (commentForm) {
    event.preventDefault();
    const text = new FormData(commentForm).get("comment").trim();
    if (!text) return;
    updatePost(commentForm.dataset.commentForm, (post) => post.comments.push({ user: "you", text }));
    commentForm.reset();
  }
});

$("#create-post-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const caption = $("#post-caption").value.trim();
  if (!caption) return;
  state.posts.unshift({
    id: crypto.randomUUID(),
    creatorId: "me",
    type: $("#post-type").value,
    style: new FormData(form).get("mediaStyle"),
    caption,
    audio: $("#post-audio").value.trim() || "Original audio",
    likes: 0,
    shares: 0,
    saves: 0,
    liked: false,
    saved: false,
    comments: [],
  });
  form.reset();
  addActivity("me", "published a new post");
  setView("home");
  renderAll();
});

$("#proposal-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const title = $("#proposal-title").value.trim();
  const detail = $("#proposal-detail").value.trim();
  if (!title || !detail) return;
  state.proposals.unshift({ id: crypto.randomUUID(), title, detail, yes: 1, no: 0, status: "polling", decision: "" });
  event.currentTarget.reset();
  renderAll();
});

$("#ai-caption").addEventListener("click", () => {
  const caption = $("#post-caption");
  const base = caption.value.trim() || "New creator drop";
  caption.value = `${base.replace(/[.!?]*$/, "")}. Built with audience prompts, creator control, and remix-ready context.`.slice(0, 220);
  renderCreatePreview();
});

$("#refine-proposal").addEventListener("click", () => {
  const title = $("#proposal-title");
  const detail = $("#proposal-detail");
  title.value = (title.value.trim() || "Community roadmap vote").replace(/^./, (letter) => letter.toUpperCase()).slice(0, 72);
  detail.value = `${(detail.value.trim() || "Members should vote on creator value, user impact, and moderation tradeoffs").replace(/[.!?]*$/, "")}. Owner approval still controls what ships.`.slice(0, 260);
});

$("#reset-demo").addEventListener("click", () => {
  state = structuredClone(seed);
  setView("home");
  renderAll();
});

roleSelect.addEventListener("change", (event) => {
  state.role = event.target.value;
  renderAll();
});

thresholdRange.addEventListener("input", (event) => {
  state.threshold = Number(event.target.value);
  renderAll();
});

searchInput.addEventListener("input", renderFeed);
$("#create-post-form").addEventListener("input", renderCreatePreview);

window.addEventListener("hashchange", () => {
  setView(location.hash.replace("#", "") || "home");
  renderAll();
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js").catch(() => {});
}

setView(location.hash.replace("#", "") || state.currentView || "home");
renderAll();
