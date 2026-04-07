const API_KEY = "e5bfde3f732f20db73f8dbf1808d8dde"; 
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

const grid = document.getElementById("movie-grid");
const searchInput = document.getElementById("search");
const watchlistDiv = document.getElementById("watchlist");
const genreBar = document.getElementById("genre-bar");
const ratingFilter = document.getElementById("rating-filter");
const spinner = document.getElementById("spinner");
const themeToggle = document.getElementById("theme-toggle");

let currentGenre = "";
let minRating = 0;
let currentPage = 1;
let totalPages = 1;

const prevBtn  = document.getElementById("prev-page");
const nextBtn  = document.getElementById("next-page");
const pageInfo = document.getElementById("page-info");

// ──────── Pagination Controls ────────
prevBtn.addEventListener("click", () => {
  if (currentPage > 1) { currentPage--; fetchMovies(currentGenre); }
});
nextBtn.addEventListener("click", () => {
  if (currentPage < totalPages) { currentPage++; fetchMovies(currentGenre); }
});

function updatePagination() {
  pageInfo.textContent = `Page ${currentPage} / ${totalPages}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage >= totalPages;
}

// ──────── Theme Toggle ────────
const savedTheme = localStorage.getItem("theme") || "dark";
document.documentElement.setAttribute("data-theme", savedTheme);
themeToggle.textContent = savedTheme === "dark" ? "☀️" : "🌙";

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  themeToggle.textContent = next === "dark" ? "☀️" : "🌙";
});

// Show / hide spinner
function setLoading(on) {
  if (on) { spinner.classList.remove("hidden"); grid.innerHTML = ""; }
  else     { spinner.classList.add("hidden"); }
}

// Fetch popular movies (optionally by genre)
async function fetchMovies(genreId = "") {
  setLoading(true);
  try {
    let url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${currentPage}`;
    if (genreId) url += `&with_genres=${genreId}`;
    const res = await fetch(url);
    const data = await res.json();
    totalPages = Math.min(data.total_pages, 20); // cap at 20 pages
    const filtered = data.results.filter(m => m.vote_average >= minRating);
    displayMovies(filtered);
    updatePagination();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
}

// Display movies
function displayMovies(movies) {
  grid.innerHTML = "";

  movies.forEach(movie => {
    const card = document.createElement("div");
    card.classList.add("movie-card");

    card.innerHTML = `
      <img src="${IMG_URL + movie.poster_path}" alt="${movie.title}" loading="lazy" />
      <h3>${movie.title}</h3>
      <p>⭐ ${movie.vote_average.toFixed(1)}</p>
      <button onclick="event.stopPropagation(); addToWatchlist('${movie.title.replace(/'/g,"\\'")}')">+ Watchlist</button>
    `;

    card.addEventListener("click", () => openModal(movie));
    grid.appendChild(card);
  });
}

// Genre filter
genreBar.addEventListener("click", (e) => {
  const btn = e.target.closest(".genre-btn");
  if (!btn) return;

  document.querySelectorAll(".genre-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  currentGenre = btn.dataset.id;
  currentPage = 1;
  fetchMovies(currentGenre);
});

// Rating filter
ratingFilter.addEventListener("change", () => {
  minRating = parseFloat(ratingFilter.value);
  currentPage = 1;
  fetchMovies(currentGenre);
});

// Search movies
searchInput.addEventListener("input", async (e) => {
  const query = e.target.value.trim();

  if (query === "") {
    fetchMovies(currentGenre);
    return;
  }

  setLoading(true);
  try {
    const res = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    const filtered = data.results.filter(m => m.vote_average >= minRating);
    displayMovies(filtered);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
});

// Watchlist
function addToWatchlist(title) {
  let list = JSON.parse(localStorage.getItem("watchlist")) || [];

  if (!list.includes(title)) {
    list.push(title);
    localStorage.setItem("watchlist", JSON.stringify(list));
    renderWatchlist();
  }
}

// Render watchlist
function renderWatchlist() {
  let list = JSON.parse(localStorage.getItem("watchlist")) || [];

  // Update badge
  const badge = document.getElementById("wl-count");
  if (badge) badge.textContent = list.length;

  if (list.length === 0) {
    watchlistDiv.innerHTML = "<p style='color:#64748b;font-size:0.9rem;'>No movies saved</p>";
    return;
  }

  watchlistDiv.innerHTML = list.map((movie, i) => `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; gap:8px;">
      <span style="font-size:0.88rem; line-height:1.3;">${movie}</span>
      <button onclick="removeMovie(${i})">❌</button>
    </div>
  `).join("");
}

// Clear all watchlist
function clearWatchlist() {
  localStorage.removeItem("watchlist");
  renderWatchlist();
}

document.getElementById("clear-watchlist").addEventListener("click", clearWatchlist);

// Remove movie
function removeMovie(index) {
  let list = JSON.parse(localStorage.getItem("watchlist")) || [];
  list.splice(index, 1);
  localStorage.setItem("watchlist", JSON.stringify(list));
  renderWatchlist();
}

// Init
fetchMovies();
renderWatchlist();

// ──────── Modal ────────
const modalOverlay  = document.getElementById("modal-overlay");
const modalClose    = document.getElementById("modal-close");
const modalPoster   = document.getElementById("modal-poster");
const modalTitle    = document.getElementById("modal-title");
const modalMeta     = document.getElementById("modal-meta");
const modalOverview = document.getElementById("modal-overview");
const modalWlBtn    = document.getElementById("modal-watchlist-btn");

function openModal(movie) {
  modalPoster.src   = movie.poster_path ? IMG_URL + movie.poster_path : "";
  modalPoster.alt   = movie.title;
  modalTitle.textContent    = movie.title;
  modalMeta.textContent     = `⭐ ${movie.vote_average.toFixed(1)}  •  📅 ${movie.release_date || "N/A"}`;
  modalOverview.textContent = movie.overview || "No description available.";
  modalWlBtn.onclick = () => { addToWatchlist(movie.title); closeModal(); };
  modalOverlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modalOverlay.classList.add("hidden");
  document.body.style.overflow = "";
}

modalClose.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });