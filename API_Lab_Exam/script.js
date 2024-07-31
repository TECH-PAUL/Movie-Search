const API_KEY = 'c36b3e37'; // Replace with your OMDb API key
const API_URL = 'https://www.omdbapi.com/';
const RESULTS_PER_PAGE = 5;

let currentPage = 1;
let totalResults = 0;

document.getElementById('search-button').addEventListener('click', handleSearch);
document.getElementById('search-input').addEventListener('input', handleSearchInput);
document.getElementById('prev-page').addEventListener('click', handlePrevPage);
document.getElementById('next-page').addEventListener('click', handleNextPage);

async function handleSearch() {
    const title = getSearchInputValue();
    if (!title) return;

    currentPage = 1; // Reset to the first page
    const data = await fetchMovies(title, currentPage);
    displaySuggestions(data);
}

async function handleSearchInput() {
    const title = getSearchInputValue();
    if (!title) {
        clearSuggestions();
        return;
    }

    currentPage = 1; // Reset to the first page
    const data = await fetchMovies(title, currentPage);
    displaySuggestions(data);
}

async function handlePrevPage(e) {
    e.preventDefault();
    if (currentPage > 1) {
        currentPage--;
        await updateSuggestions();
    }
}

async function handleNextPage(e) {
    e.preventDefault();
    if (currentPage * RESULTS_PER_PAGE < totalResults) {
        currentPage++;
        await updateSuggestions();
    }
}

function getSearchInputValue() {
    return document.getElementById('search-input').value.trim();
}

async function fetchMovies(title, page) {
    const response = await fetch(`${API_URL}?s=${encodeURIComponent(title)}&page=${page}&apikey=${API_KEY}`);
    return response.json();
}

async function updateSuggestions() {
    const title = getSearchInputValue();
    const data = await fetchMovies(title, currentPage);
    displaySuggestions(data);
}

function displaySuggestions(data) {
    const suggestions = document.getElementById('suggestions');
    const currentPageElement = document.getElementById('current-page');
    
    clearSuggestions();

    if (data.Response === 'True') {
        totalResults = parseInt(data.totalResults, 10);
        const movies = data.Search.slice(0, RESULTS_PER_PAGE);
        
        movies.forEach(movie => {
            const suggestionItem = createSuggestionItem(movie);
            suggestions.appendChild(suggestionItem);
        });

        updatePaginationControls();
        currentPageElement.textContent = currentPage;
    } else {
        suggestions.innerHTML = `<div class="alert alert-warning" role="alert">${data.Error}</div>`;
    }
}

function createSuggestionItem(movie) {
    const item = document.createElement('a');
    item.href = '#';
    item.className = 'list-group-item list-group-item-action';
    item.innerHTML = `
        <img src="${movie.Poster}" alt="${movie.Title}" class="img-thumbnail">
        <div class="movie-title">${movie.Title} (${movie.Year})</div>
    `;
    item.addEventListener('click', async () => {
        const details = await fetchMovieDetails(movie.imdbID);
        displayMovieInfo(details);
    });
    return item;
}

async function fetchMovieDetails(imdbID) {
    const response = await fetch(`${API_URL}?i=${imdbID}&apikey=${API_KEY}`);
    return response.json();
}

function displayMovieInfo(data) {
    const movieInfo = document.getElementById('movie-info');

    if (data.Response === 'True') {
        movieInfo.innerHTML = `
            <img src="${data.Poster}" alt="${data.Title}" class="img-fluid movie-poster">
            <div class="movie-details">
                <h2>${data.Title} (${data.Year})</h2>
                <p><strong>Genre:</strong> ${data.Genre}</p>
                <p><strong>Director:</strong> ${data.Director}</p>
                <p><strong>Actors:</strong> ${data.Actors}</p>
                <p><strong>Plot:</strong> ${data.Plot}</p>
                <p><strong>IMDB Rating:</strong> ${data.imdbRating}</p>
            </div>
        `;
    } else {
        movieInfo.innerHTML = `<div class="alert alert-danger" role="alert">${data.Error}</div>`;
    }
}

function clearSuggestions() {
    document.getElementById('suggestions').innerHTML = '';
}

function updatePaginationControls() {
    document.getElementById('prev-page').classList.toggle('disabled', currentPage === 1);
    document.getElementById('next-page').classList.toggle('disabled', currentPage * RESULTS_PER_PAGE >= totalResults);
}
