// Import the necessary modules for SQLite database interaction
const sqlite3 = require('sqlite3').verbose(); // Import sqlite3 with verbose mode for debugging
const sqlite = require('sqlite'); // Import sqlite to provide async/await API over sqlite3

// Open a connection to the SQLite database
async function openConnectionToDB() {
  const db = await sqlite.open({
    filename: './testing database.db3', // Path to the SQLite database file
    driver: sqlite3.Database // Specify the database driver
  });
  return db; // Return the database connection object
}

// Query the database to return an array of all articles from the 'MovRec_movie' table
async function getAllArticles() {
  const db = await openConnectionToDB(); // Open database connection
  const articles = await db.all('SELECT * FROM MovRec_movie'); // Execute SQL query to select all rows
  console.log(articles); // Log the retrieved articles
  return articles; // Return the array of articles
}

// Query the database to return details of a specific article by its ID
async function getArticleDetail(article_id) {
  const db = await openConnectionToDB(); // Open database connection
  const returnedRow = await db.get('SELECT * FROM MovRec_movie WHERE id = ?', article_id); // Execute SQL query with parameterized id
  console.log(returnedRow); // Log the details of the article
  return returnedRow; // Return the details of the article
}

// Check if an article ID is available (i.e., not used by any existing article)
async function returnTrueIfArticleIdIsFree(article_id) {
  const db = await openConnectionToDB(); // Open database connection
  const articleDetails = await db.all('SELECT * FROM MovRec_movie WHERE id = ?', article_id); // Execute SQL query with parameterized id
  // Check if the query returned any rows; if not, the ID is free
  return articleDetails.length === 0;
}

// Add a new article to the database
async function addArticle(article_data) {
  const db = await openConnectionToDB(); // Open database connection
  // Check if the article ID is free before adding the new article
  if (await returnTrueIfArticleIdIsFree(article_data.id)) {
    // Insert the new article into the 'articles' table
    const result = await db.run('INSERT INTO articles (id, title, description, content, author, likes, arabicContent) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [article_data.id, article_data.title, article_data.description, article_data.content, article_data.author, article_data.likes, article_data.arabicContent]);
    return result; // Return the result of the insertion (metadata)
  } else {
    console.log(`Sorry, the article ID: ${article_data.id} is already used. Please try another one.`);
  }
}

// Update an existing article's details in the database
async function updateArticle(article_id, data) {
  const db = await openConnectionToDB(); // Open database connection
  // Check if the article ID exists before updating the article
  if (!await returnTrueIfArticleIdIsFree(article_id)) {
    // Update the specified article's details in the 'articles' table
    const result = await db.run('UPDATE articles SET title = ?, description = ?, content = ?, author = ?, likes = ?, arabicContent = ? WHERE id = ?',
      [data.title, data.description, data.content, data.author, data.likes, data.arabicContent, article_id]);
    return result; // Return the result of the update (metadata)
  } else {
    console.log(`Sorry, there is no such article with id: ${article_id}`);
  }
}

// Fetch movies from the database based on various attributes
async function getMoviesByAttributes(filters) {
  const db = await openConnectionToDB(); // Open database connection
  let query = 'SELECT * FROM MovRec_movie WHERE 1=1'; // Base query
  let params = [];

  // Add filters based on provided attributes
  if (filters.genres && filters.genres.length > 0) {
    const genrePattern = filters.genres.map(() => 'genre LIKE ?').join(' OR ');
    query += ` AND (${genrePattern})`;
    params.push(...filters.genres.map(genre => `%${genre}%`));
  }

  if (filters.year) {
    query += ' AND year = ?';
    params.push(filters.year);
  }

  if (filters.minRating) {
    query += ' AND imdbRating >= ?';
    params.push(filters.minRating);
  }

  if (filters.maxRating) {
    query += ' AND imdbRating <= ?';
    params.push(filters.maxRating);
  }

  if (filters.director) {
    query += ' AND director LIKE ?';
    params.push(`%${filters.director}%`);
  }

  if (filters.cast) {
    query += ' AND cast LIKE ?';
    params.push(`%${filters.cast}%`);
  }

  if (filters.country) {
    query += ' AND country LIKE ?';
    params.push(`%${filters.country}%`);
  }

  if (filters.language) {
    query += ' AND language LIKE ?';
    params.push(`%${filters.language}%`);
  }

  const movies = await db.all(query, params); // Execute the query with the parameters

  // Set a default placeholder image URL
  const placeholderImage = 'https://via.placeholder.com/300x450?text=No+Image+Available';

  // Replace missing poster images with the placeholder image
  movies.forEach(movie => {
    if (!movie.poster) {
      movie.poster = placeholderImage;
    }
  });

  return movies; // Return the list of movies that match the filters
}

// Delete an article from the database by its ID
async function deleteArticle(article_id) {
  const db = await openConnectionToDB(); // Open database connection
  // Check if the article ID exists before deleting the article
  if (!await returnTrueIfArticleIdIsFree(article_id)) {
    // Delete the specified article from the 'MovRec_movie' table
    const result = await db.run(`DELETE FROM MovRec_movie WHERE id = ${article_id}`);
    console.log("Result:", result);
    return result; // Return the result of the deletion (metadata)
  } else {
    console.log(`Sorry, there is no such article with id: ${article_id}`);
  }
}

// Increment the number of likes for an article
async function likeArticle(article_id) {
  const db = await openConnectionToDB(); // Open database connection
  // Check if the article ID exists before incrementing likes
  if (!await returnTrueIfArticleIdIsFree(article_id)) {
    // Retrieve the current number of likes
    let currentNumberOfLikes = (await db.get('SELECT likes FROM MovRec_movie WHERE id = ?', article_id)).likes;
    // Increment the number of likes by 1
    currentNumberOfLikes = currentNumberOfLikes + 1;
    // Update the likes in the 'articles' table
    const result = await db.run('UPDATE articles SET likes = ? WHERE id = ?', currentNumberOfLikes, article_id);
    return result; // Return the result of the update (metadata)
  } else {
    console.log(`Sorry, there is no such article with id: ${article_id}`);
  }
}

// Export the functions for use in other parts of the application
module.exports = {
  openConnectionToDB,
  getAllArticles,
  getArticleDetail,
  addArticle,
  updateArticle,
  deleteArticle,
  likeArticle,
  getMoviesByAttributes
};
