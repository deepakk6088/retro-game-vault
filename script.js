const API_KEY = "6cfdc83e79f74fc196b12c9edb61cb3e";
const URL = `https://api.rawg.io/api/games?key=${API_KEY}`;

const gamesContainer = document.getElementById("games");
const loader = document.getElementById("loader");
const errorText = document.getElementById("error");

async function fetchGames() {
  loader.classList.remove("hidden");
  errorText.classList.add("hidden");

  try {
    const response = await fetch(URL);

    if (!response.ok) {
      throw new Error("Error");
    }

    const data = await response.json();
    displayGames(data.results);

  } catch (error) {
    errorText.classList.remove("hidden");
  } finally {
    loader.classList.add("hidden");
  }
}

function displayGames(games) {
  gamesContainer.innerHTML = "";

  games.forEach(game => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <img src="${game.background_image}" alt="${game.name}">
      <h3>${game.name}</h3>
      <p>⭐ ${game.rating}</p>
    `;

    gamesContainer.appendChild(div);
  });
}

fetchGames();