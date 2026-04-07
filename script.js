const API_KEY = "6cfdc83e79f74fc196b12c9edb61cb3e";
let currentPage = 1;
const URL = (page) => `https://api.rawg.io/api/games?key=${API_KEY}&page_size=12&page=${page}`;

const gamesContainer = document.getElementById("games");
const loader = document.getElementById("loader");
const errorText = document.getElementById("error");

const searchInput = document.getElementById("search");
const ratingFilter = document.getElementById("ratingFilter");
const sortOption = document.getElementById("sortOption");
const genreFilter = document.getElementById("genreFilter");
const themeToggle = document.getElementById("themeToggle");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageNumber = document.getElementById("pageNumber");

const favoriteGamesContainer = document.getElementById("favoriteGames");

let allGames = [];
let filteredGames = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

async function fetchGames(page = 1) {
  loader.classList.remove("hidden");
  errorText.classList.add("hidden");

  try {
    const response = await fetch(URL(page));

    if (!response.ok) {
      throw new Error("Error");
    }

    const data = await response.json();
    allGames = data.results;
    filteredGames = [...allGames];
    populateGenres(allGames);
    applyFeatures();
    pageNumber.textContent = `Page ${currentPage}`;
  } catch (error) {
    errorText.classList.remove("hidden");
  } finally {
    loader.classList.add("hidden");
  }
}

function populateGenres(games) {
  const allGenres = games.flatMap(game => game.genres.map(genre => genre.name));
  const uniqueGenres = [...new Set(allGenres)];

  genreFilter.innerHTML = `<option value="all">All Genres</option>`;

  uniqueGenres.forEach(genre => {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre;
    genreFilter.appendChild(option);
  });
}

function applyFeatures() {
  let searchValue = searchInput.value.toLowerCase();
  let ratingValue = ratingFilter.value;
  let sortValue = sortOption.value;
  let selectedGenre = genreFilter.value;

  filteredGames = allGames
    .filter(game => game.name.toLowerCase().includes(searchValue))
    .filter(game => {
      if (ratingValue === "all") return true;
      return game.rating >= Number(ratingValue);
    })
    .filter(game => {
      if (selectedGenre === "all") return true;
      return game.genres.some(genre => genre.name === selectedGenre);
    });

  if (sortValue === "nameAsc") {
    filteredGames.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortValue === "nameDesc") {
    filteredGames.sort((a, b) => b.name.localeCompare(a.name));
  } else if (sortValue === "ratingHigh") {
    filteredGames.sort((a, b) => b.rating - a.rating);
  } else if (sortValue === "ratingLow") {
    filteredGames.sort((a, b) => a.rating - b.rating);
  }

  displayGames(filteredGames);
  displayFavoriteGames();
}

function displayGames(games) {
  gamesContainer.innerHTML = "";

  games.forEach(game => {
    const div = document.createElement("div");
    div.className = "card";

    const isFavorite = favorites.some(fav => fav.id === game.id);
    const firstGenre = game.genres.length ? game.genres[0].name : "Unknown";

    div.innerHTML = `
      <img src="${game.background_image || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${game.name}">
      <h3>${game.name}</h3>
      <p>⭐ ${game.rating}</p>
      
      <span class="genre-tag">${firstGenre}</span>
      <br>
      <button class="favorite-btn" data-id="${game.id}">
        ${isFavorite ? "❤️ Added" : "🤍 Add to Favorite"}
      </button>
    `;

    gamesContainer.appendChild(div);
  });

  addFavoriteEvents();
}

function displayFavoriteGames() {
  favoriteGamesContainer.innerHTML = "";

  if (favorites.length === 0) {
    favoriteGamesContainer.innerHTML = "<p>No favorite games selected yet.</p>";
    return;
  }

  favorites.forEach(game => {
    const div = document.createElement("div");
    div.className = "card";

    const firstGenre = game.genres.length ? game.genres[0].name : "Unknown";

    div.innerHTML = `
      <img src="${game.background_image || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${game.name}">
      <h3>${game.name}</h3>
      <p>⭐ ${game.rating}</p>
      <p>📅 ${game.released || "No release date"}</p>
      <span class="genre-tag">${firstGenre}</span>
      <br>
      <button class="remove-btn" data-id="${game.id}">Remove</button>
    `;

    favoriteGamesContainer.appendChild(div);
  });

  addRemoveEvents();
}

function addFavoriteEvents() {
  const favButtons = document.querySelectorAll(".favorite-btn");

  favButtons.forEach(button => {
    button.addEventListener("click", () => {
      const gameId = Number(button.dataset.id);
      const selectedGame = allGames.find(game => game.id === gameId);

      const alreadyFavorite = favorites.some(game => game.id === gameId);

      if (!alreadyFavorite) {
        favorites.push(selectedGame);
      }

      localStorage.setItem("favorites", JSON.stringify(favorites));
      displayGames(filteredGames);
      displayFavoriteGames();
    });
  });
}

function addRemoveEvents() {
  const removeButtons = document.querySelectorAll(".remove-btn");

  removeButtons.forEach(button => {
    button.addEventListener("click", () => {
      const gameId = Number(button.dataset.id);

      favorites = favorites.filter(game => game.id !== gameId);
      localStorage.setItem("favorites", JSON.stringify(favorites));

      displayGames(filteredGames);
      displayFavoriteGames();
    });
  });
}

searchInput.addEventListener("input", applyFeatures);
ratingFilter.addEventListener("change", applyFeatures);
sortOption.addEventListener("change", applyFeatures);
genreFilter.addEventListener("change", applyFeatures);

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    themeToggle.textContent = "Light";
  } else {
    themeToggle.textContent = "Dark";
  }
});

nextBtn.addEventListener("click", () => {
  currentPage++;
  fetchGames(currentPage);
});

prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    fetchGames(currentPage);
  }
});

fetchGames();