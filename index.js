const API_KEY = "e5bfde3f732f20db73f8dbf1808d8dde"; 
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

const grid = document.getElementById("movie-grid");
const searchInput = document.getElementById("search");
const watchlistDiv = document.getElementById("watchlist");
const genreBar = document.getElementById("genre-bar");
const ratingFilter = document.getElementById("rating-filter");
const spinner = document.getElementById("spinner");

let currentGenre = "";
let minRating = 0;

// Show / hide spinner
function setLoading(on) {
  if (on) { spinner.classList.remove("hidden"); grid.innerHTML = ""; }
  else     { spinner.classList.add("hidden"); }
}

// Fetch popular movies (optionally by genre)
async function fetchMovies(genreId = "") {
  setLoading(true);
  try {
    let url = `${BASE_URL}/movie/popular?api_key=${API_KEY}`;
    if (genreId) url += `&with_genres=${genreId}`;
    const res = await fetch(url);
    const data = await res.json();
    const filtered = data.results.filter(m => m.vote_average >= minRating);
    displayMovies(filtered);
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
      <button onclick="addToWatchlist('${movie.title.replace(/'/g,"\\'")}')">+ Watchlist</button>
    `;

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
  fetchMovies(currentGenre);
});

// Rating filter
ratingFilter.addEventListener("change", () => {
  minRating = parseFloat(ratingFilter.value);
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