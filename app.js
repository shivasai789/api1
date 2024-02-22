const express = require('express')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const path = require('path')

const app = express()
app.use(express.json())

const dbpath = path.join(__dirname, 'moviesData.db')

let db = null

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is starting...')
    })
  } catch (e) {
    console.log(`Error DB: ${e.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

//returning the object
const movieReturningObjectFromDb = movie => {
  return {
    movieName: movie.movie_name,
  }
}

//Get movies API
app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `SELECT * FROM movie;`
  const movieArray = await db.all(getMoviesQuery)
  response.send(movieArray.map(each => movieReturningObjectFromDb(each)))
})

//Add movie API
app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const postMovieQuery = `
  INSERT INTO 
    movie (director_id,movie_name,lead_actor)
  VALUES 
  (
    ${directorId},
    "${movieName}",
    "${leadActor}"
  );`
  await db.run(postMovieQuery)
  response.send('Movie Successfully Added')
})

//returning a object
const ReturningObjectFromDb = movie => {
  return {
    movieId: movie.movie_id,
    directorId: movie.director_id,
    movieName: movie.movie_name,
    leadActor: movie.lead_actor,
  }
}

//Get moive By MovieId API
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieidQuery = `
  SELECT 
    * 
  FROM 
    movie 
  WHERE 
   movie_id = ${movieId};`
  const movie = await db.get(getMovieidQuery)
  response.send(ReturningObjectFromDb(movie))
})

//Update Moive API
app.put('/movies/:movieId/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const updateMovieQuery = `
  INSERT INTO 
    movie(director_id,movie_name,lead_actor) 
  VALUES
    ( 
      ${directorId},
      "${movieName}",
      "${leadActor}"
    );`
  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

//Delete Movie API
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
  DELETE FROM 
    movie 
  WHERE 
    movie_id = ${movieId};`
  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

//Get Directors API
app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `
  SELECT 
    * 
  FROM 
    director;`
  const directorsArray = await db.all(getDirectorsQuery)
  const returningObject = director => {
    return {
      directorId: director.director_id,
      directorName: director.director_name,
    }
  }
  response.send(
    directorsArray.map(eachDirector => returningObject(eachDirector)),
  )
})

//Get director API
app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getMovieQuery = `
  SELECT 
    * 
  FROM 
    movie 
  WHERE 
    director_id = ${directorId};`
  const directorArray = await db.all(getMovieQuery)
  const returningObject = eachItem => {
    return {
      movieName: eachItem.movie_name,
    }
  }
  response.send(directorArray.map(eachMovie => returningObject(eachMovie)))
})

module.exports = app
