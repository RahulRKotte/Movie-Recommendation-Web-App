import express from "express";
import axios from "axios";
import fs from "fs";

const rawData = fs.readFileSync('api-key.json');
const config= JSON.parse(rawData);

const app = express();
const port = 2023;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const tmdbApiKey = config.api;

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

app.get("/getSimilarMovies", async (req, res) => {
    try {
        const movieName = req.query.movieName;

        const searchResponse = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(movieName)}`);
        const firstResult = searchResponse.data.results[0];

        if (!firstResult) {
            return res.render("notFound.ejs", {movieName});
        }

        const movieId = firstResult.id;

        const similarMoviesResponse = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${tmdbApiKey}`);
        const similarMovies = similarMoviesResponse.data.results;

        res.render("index", { results: similarMovies, movieName });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(port, () => {
    console.log(`App listening on Port: ${port}`);
});
