import express from "express";
import axios from "axios";
import fs from "fs";

const rawData = fs.readFileSync('api-key.json');
const config= JSON.parse(rawData);

const app = express();
const port = 500;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const tmdbApiKey = config.api;
const yourApiBaseUrl = 'http://localhost:5000'; 

app.get("/", async (req, res) => {
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/trending/movie/week?api_key=${tmdbApiKey}`);
        const trendingMovies = response.data.results;

        res.render("home", { movies: trendingMovies });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/creatorFavorites", async (req, res) =>{
    try {
        const responseFavorite = await axios.get(`${yourApiBaseUrl}/favorite`);
        const myFavoriteMovies = responseFavorite.data.favorites;
        console.log("MY API");
        let favoriteMovies = [];

        for (let i = 0; i < myFavoriteMovies.length; i++) {
            const recRes = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(myFavoriteMovies[i])}`);
            const firstRec = recRes.data.results[0];
            favoriteMovies.push(firstRec);
        }

        res.render("favorites", { movies: favoriteMovies});
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/getSimilarMovies", async (req, res) => {
    try {
        let movieName = req.query.movieName;

        const searchResponse = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(movieName)}`);
        const firstResult = searchResponse.data.results[0];

        if (!firstResult) {
            return res.render("notFound.ejs", { movieName });
        }

        const movieId = firstResult.id;
        movieName = firstResult.title;

        const similarMoviesResponse = await axios.get(`${yourApiBaseUrl}/recommendation/?Title=${movieName}`);

        if (similarMoviesResponse.data.error) {
            console.log("TMDB API");
            const tmdbSimilarMoviesResponse = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${tmdbApiKey}`);
            const similarMovies = tmdbSimilarMoviesResponse.data.results;

            res.render("index", { results: similarMovies, movieName });
        } else {
            console.log("MY API");
            const similarMovies = similarMoviesResponse.data.SuggestedMovies;
            let recommendedMovies = [];

            for (let i = 0; i < similarMovies.length; i++) {
                const recRes = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(similarMovies[i])}`);
                const firstRec = recRes.data.results[0];
                recommendedMovies.push(firstRec);
            }

            res.render("index", { results: recommendedMovies, movieName });
        }
    } catch (error) {
        console.error("Error from recommendation system API:", error.response ? error.response.data : error.message);
        
        res.status(500).send("Internal Server Error");
    }
    
});

app.listen(port, () => {
    console.log(`App listening on Port: ${port}`);
});
