const API_KEY = "e5bfde3f732f20db73f8dbf1808d8dde"; 
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

const grid = document.getElementById("movie-grid");
const searchInput = document.getElementById("search");
const watchlistDiv = document.getElementById("watchlist");
const genreBar = document.getElementById("genre-bar");

let currentGenre = "";

// Fetch popular movies (optionally by genre)
async function fetchMovies(genreId = "") {
  try {
    let url = `${BASE_URL}/movie/popular?api_key=${API_KEY}`;
    if (genreId) url += `&with_genres=${genreId}`;
    const res = await fetch(url);
    const data = await res.json();
    displayMovies(data.results);
  } catch (err) {
    console.error(err);
  }
}

// Display movies
function displayMovies(movies) {
  grid.innerHTML = "";

  movies.forEach(movie => {
    const card = document.createElement("div");
    card.classList.add("movie-card");

    card.innerHTML = `
      <img src="${IMG_URL + movie.poster_path}" />
      <h3>${movie.title}</h3>
      <p>⭐ ${movie.vote_average}</p>
      <button onclick="addToWatchlist('${movie.title}')">+ Watchlist</button>
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

// Search movies
searchInput.addEventListener("input", async (e) => {
  const query = e.target.value;

  if (query === "") {
    fetchMovies(currentGenre);
    return;
  }

  const res = await fetch(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`
  );
  const data = await res.json();
  displayMovies(data.results);
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
    watchlistDiv.innerHTML = "<p>No movies saved</p>";
    return;
  }

  watchlistDiv.innerHTML = list.map((movie, i) => `
    <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
      <span>${movie}</span>
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