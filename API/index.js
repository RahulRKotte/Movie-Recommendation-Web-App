import express from "express";
import fs from "fs";

const rawData = fs.readFileSync('suggested_movies.json');
const suggestions = JSON.parse(rawData);

const rawDataf = fs.readFileSync('favorites.json');
const favorite = JSON.parse(rawDataf);

const app = express();
const port = 5000;

app.get("/random", (req, res) =>{
    const randomSuggestion = Math.floor(Math.random() * suggestions.length);
    res.json(suggestions[randomSuggestion])
});

app.get("/recommendation", (req, res) => {
  const title = req.query.Title;

  if (!title) {
      return res.status(400).json({ error: "Please provide a movie title" });
  }

  const suggestion = suggestions.find((movie) => movie.Title.toLowerCase() === title.toLowerCase());

  if (suggestion) {
      res.json(suggestion);
  } else {
      res.status(200).json({ error: "Movie not found" });
  }
});

app.get("/favorite", (req, res) => {
    res.json(favorite);
});



app.listen(port, () =>{
    console.log(`server running on port: ${port}`);
});