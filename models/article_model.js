const sqlite3 = require('sqlite3').verbose();
const sqlite = require('sqlite');

async function openConnectionToDB() {
  const db = await sqlite.open({
    filename: './testing database.db3',
    driver: sqlite3.Database
  });
  return db;
}

// Query the database to return an array of articles from the articles table
async function getAllArticles() {
  const db = await openConnectionToDB();
  const articles = await db.all('SELECT * FROM MovRec_movie');
  console.log(articles);
  return articles;
}

// Query the database to return one object holding all the details of the article with the given id
async function getArticleDetail(article_id) {
  const db = await openConnectionToDB();
  const returnedRow = await db.get('SELECT * FROM MovRec_movie WHERE id = ?', article_id);
  console.log(returnedRow);
  return returnedRow;
}

async function returnTrueIfArticleIdIsFree(article_id) {
  const db = await openConnectionToDB();
  const articleDetails = await db.all('SELECT * FROM MovRec_movie WHERE id = ?', article_id);
  if (await articleDetails.length === 0) {
    return true;
  } else {
    return false;
  }
}

async function addArticle(article_data) {
  const db = await openConnectionToDB();
  if (await returnTrueIfArticleIdIsFree(article_data.id) === true) {
    const result = await db.run('INSERT INTO articles (id, title, description, content, author, likes, arabicContent) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [article_data.id, article_data.title, article_data.description, article_data.content, article_data.author, article_data.likes, article_data.arabicContent]);
    return result;
  } else {
    console.log(`Sorry, the article ID: ${article_data.id} is already used. Please try another one.`);
  }
}

// Updates the articles table with the given data and returns metadata about the updated row
async function updateArticle(article_id, data) {
  const db = await openConnectionToDB();
  if (await returnTrueIfArticleIdIsFree(article_id) === false) {
    const result = await db.run('UPDATE articles SET title = ?, description = ?, content = ?, author = ?, likes = ?, arabicContent = ? WHERE id = ?',
      [data.title, data.description, data.content, data.author, data.likes, data.arabicContent, article_id]);
    return result;
  } else {
    console.log(`Sorry, there is no such article with id: ${article_id}`);
  }
}

// Fetch movies by single or multiple genres
async function getAllMoviesByGenre(genres) {
  const db = await openConnectionToDB();
  let genrePattern = genres.map(genre => `%${genre}%`);
  let query = `SELECT * FROM MovRec_movie WHERE `;

  genrePattern.forEach((pattern, index) => {
    query += `genre LIKE ?`;
    if (index < genrePattern.length - 1) query += ` OR `;
  });

  const movies = await db.all(query, ...genrePattern);
  return movies;
}

async function deleteArticle(article_id) {
  const db = await openConnectionToDB();
  if (await returnTrueIfArticleIdIsFree(article_id) === false) {
    const result = await db.run(`DELETE FROM MovRec_movie WHERE id = ${article_id}`);
    console.log("Result:", result);
    return result;
  } else {
    console.log(`Sorry, there is no such article with id: ${article_id}`);
  }
}

// Find the number of likes for the article, increment it, and save it back to the table
async function likeArticle(article_id) {
  const db = await openConnectionToDB();
  if (await returnTrueIfArticleIdIsFree(article_id) === false) {
    let currentNumberOfLikes = (await db.get('SELECT likes FROM MovRec_movie WHERE id = ?', article_id)).likes;
    currentNumberOfLikes = currentNumberOfLikes + 1;
    const result = await db.run('UPDATE articles SET likes = ? WHERE id = ? ', currentNumberOfLikes, article_id);
    return result;
  } else {
    console.log(`Sorry, there is no such article with id: ${article_id}`);
  }
}

module.exports = {
  openConnectionToDB,
  getAllArticles,
  getArticleDetail,
  addArticle,
  updateArticle,
  deleteArticle,
  likeArticle,
  getAllMoviesByGenre
};
