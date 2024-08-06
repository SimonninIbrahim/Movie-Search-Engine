/*


a.	getAllArticles(): query the database to return an array of articles from the articles table.
b.	getArticleDetail(article_id): query the database to return one object holding all the details of the article with the id given. Return data from the articles table.
c.	addArticle (article_data): inserts in the articles table the article_data given. Note the article_data parameter is an object that holds the article columns like the author and the content. And returns metadata about the inserted row.
d.	updateArticle (article_id, data): updates the articles table with the data given. Note that the data parameter is an object that holds the article columns like the author and the content And returns metadata about the updated row.
e.	deleteArticle(article_id): deletes the article from the database. And returns metadata about the affected row.
f.	likeArticle(article_id): find the number of likes for the article, increment it, and save it back to the table.


*/
const sqlite3 = require('sqlite3').verbose();
const sqlite = require('sqlite');


async function openConnectionToDB() {

  const db = await sqlite.open({
    filename: './testing database.db3',
    driver: sqlite3.Database
  });


  return db;

}

// description: query the database to return an array of articles from the articles table.
async function getAllArticles() {
  const db = await openConnectionToDB();
  // console.log('database connection opened');
  const articles = await db.all('SELECT * FROM MovRec_movie ');
  console.log(articles);
}



// description:  query the database to return one object holding all the details of the article with the id given. Return data from the articles table.
async function getArticleDetail(article_id) {


  const db = await openConnectionToDB();

  returnedRow = await db.get('SELECT * FROM MovRec_movie WHERE id = ?', article_id)

  console.log(returnedRow);
  return returnedRow;
}


async function returnTrueIfArticleIdIsFree(article_id) {

  const db = await openConnectionToDB();

  const articleDetails = await db.all('SELECT * FROM MovRec_movie WHERE id = ?', article_id);
  // console.log(`articleDetails.length is ${articleDetails.length}`)
  if (await articleDetails.length === 0) {
    return true;
  } else {
    return false;
  }
}


async function addArticle(article_data) {
  const db = await openConnectionToDB();
  // insert article_data into articles table
  // console.log(`trying to create an article with the id ${article_data.id}`)
  if (await returnTrueIfArticleIdIsFree(article_data.id) === true) {
    const result = await db.run('INSERT INTO articles (id, title, description, content, author, likes, arabicContent) VALUES (?, ?, ?, ?, ?, ?, ?)', [article_data.id, article_data.title, article_data.description, article_data.content, article_data.author, article_data.likes, article_data.arabicContent]);

    // return metadata about the inserted row
    return result;
  } else {
    console.log(`sorry the article ID: ${article_data.id} is already used. Please try another one.`);
  }
}



// function description: updates the articles table with the data given. Note that the data parameter is an object that holds the article columns like the author and the content And returns metadata about the updated row.
async function updateArticle(article_id, data) {

  const db = await openConnectionToDB();
  // insert article_data into articles table
  if (await returnTrueIfArticleIdIsFree(article_id) === false) {
    const result = await db.run('UPDATE articles SET title = ?, description = ?, content = ?, author = ?, likes = ?, arabicContent = ? WHERE id = ?', [data.title, data.description, data.content, data.author, data.likes, data.arabicContent, article_id]);

    // return metadata about the inserted row
    return result;

  } else {
    console.log(`sorry, there is no such article with id: ${article_id}`);
  }
}

async function deleteArticle(article_id) {

  const db = await openConnectionToDB();
  // insert article_data into articles table
  if (await returnTrueIfArticleIdIsFree(article_id) === false) {
    const result = await db.run(`DELETE FROM MovRec_movie  WHERE id = ${article_id}`);
    console.log("result is:");
    console.log(result);
    // return metadata about the inserted row
    return result;

  } else {
    console.log(`sorry, there is no such article with id: ${article_id}`);
  }
}


//	likeArticle(article_id): find the number of likes for the article, increment it, and save it back to the table.


async function likeArticle(article_id) {

  const db = await openConnectionToDB();

  if (await returnTrueIfArticleIdIsFree(article_id) === false) {

    // retrive the number of likes
    let currentNumberOfLikes = ((await db.get('SELECT likes FROM MovRec_movie WHERE id = ?', article_id))).likes;


    //set the new number of likes
    currentNumberOfLikes = currentNumberOfLikes + 1;
    const result = await db.run('UPDATE articles SET likes = ? WHERE id = ? ', currentNumberOfLikes, article_id);
    return result;
  } else {
    console.log(`sorry, there is no such article with id: ${article_id}`);
  }
}





module.exports = {
  openConnectionToDB,
  getAllArticles,
  getArticleDetail,
  addArticle,
  updateArticle,
  deleteArticle,
  likeArticle
};
