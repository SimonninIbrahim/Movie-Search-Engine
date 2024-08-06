// Import required modules and dependencies
const express = require('express');
const nunjucks = require('nunjucks');
const app = express();
const cookieParser = require('cookie-parser');
const articleModel = require('./models/article_model.js');
const { escape, unescape } = require('html-escaper');
const path = require('path');
const multer = require('multer');

// Middleware setup
app.use(express.static('public'));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set up file storage with multer for file uploads
const upload = multer({ dest: 'public/' });

// Main function to initialize the server and routes
async function mainIndexHtml() {
  // Open a connection to the database
  const db = await articleModel.openConnectionToDB();

  // Configure Nunjucks template engine
  nunjucks.configure('views', {
    autoescape: false,
    express: app
  });

  // Route for the home page
  app.get('/', async (req, res) => {
    try {
      // Fetch all movies from the database
      let movieSearchResult = await db.all('SELECT * FROM MovRec_movie');
      // Render the 'index.html' template with the fetched movies
      const html = nunjucks.render('index.html', { movieSearchResult });
      res.send(html); // Send the rendered HTML to the client
    } catch (error) {
      console.error("Error fetching movies:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Route for advanced search with various filters
  app.get('/search', async (req, res) => {
    try {
      // Retrieve search parameters from query
      let { genres, minYear, maxYear, minRating, maxRating, director, cast, country, language } = req.query;

      // Adjust for decade-based year ranges
      if (minYear) minYear = parseInt(minYear);
      if (maxYear) maxYear = parseInt(maxYear);

      // Call searchMovies with the extracted parameters
      let movieSearchResult = await articleModel.searchMovies({
        genres,
        minYear,
        maxYear,
        minRating,
        maxRating,
        director,
        cast,
        country,
        language
      });

      // Render the 'index.html' template with the search results
      const html = nunjucks.render('index.html', { movieSearchResult });
      res.send(html); // Send the rendered HTML to the client
    } catch (error) {
      console.error("Error fetching movies by search parameters:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Route for displaying article details by ID
  app.get('/article.html/:id', async (req, res) => {
    try {
      let retrievedLanguage = req.cookies.lang;
      console.log(`/article retrieved language is ${retrievedLanguage}`);

      // Fetch the article details by ID
      let article = await articleModel.getArticleDetail(req.params.id);
      // Unescape HTML content for rendering
      article.content = unescape(article.content);
      article.arabicContent = unescape(article.arabicContent);

      // Render the 'article.html' template with the article details and language preference
      const html = nunjucks.render('article.html', { article, retrievedLanguage });
      res.send(html); // Send the rendered HTML to the client
    } catch (error) {
      console.error("Error fetching article details:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Route for displaying the page to create a new article
  app.get('/new_article.html', async (req, res) => {
    try {
      const article = {}; // Initialize an empty article object
      // Render the 'new_article.html' template for creating a new article
      const html = nunjucks.render('new_article.html', article);
      res.send(html); // Send the rendered HTML to the client
    } catch (error) {
      console.error("Error displaying new article page:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Route for editing an existing article by ID
  app.get('/edit/:id', async (req, res) => {
    try {
      // Fetch the article details by ID
      let article = await articleModel.getArticleDetail(req.params.id);
      // Unescape HTML content for rendering
      article.content = unescape(article.content);
      // Render the 'new_article.html' template with the article details for editing
      const html = nunjucks.render('new_article.html', { article });
      res.send(html); // Send the rendered HTML to the client
    } catch (error) {
      console.error("Error fetching article for edit:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Route for handling form submission to update an article
  app.post('/edit/:id', async (req, res) => {
    try {
      // Fetch the original article details by ID
      const originalArticle = await articleModel.getArticleDetail(req.params.id);

      // Prepare the updated article data
      const editedArticle = {
        id: originalArticle.id,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content,
        author: req.body.author,
        likes: originalArticle.likes,
        arabicContent: req.body.arabicContent
      }

      // Update the article in the database
      const result = await articleModel.updateArticle(req.params.id, editedArticle);
      res.send(JSON.stringify(result)); // Send the update result as JSON
    } catch (error) {
      console.error("Error updating article:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Route for deleting an article by ID
  app.delete('/article.html/:id/delete', async (req, res) => {
    try {
      // Delete the article from the database
      const result = await articleModel.deleteArticle(req.params.id);
      res.send(JSON.stringify(result)); // Send the deletion result as JSON
    } catch (error) {
      console.error("Error deleting article:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Route for liking an article by ID
  app.put('/article.html/:id/like', async (req, res) => {
    try {
      // Increment the like count for the article
      const result = await articleModel.likeArticle(req.params.id);
      res.send(JSON.stringify(result)); // Send the like result as JSON
    } catch (error) {
      console.error("Error liking article:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Route for handling file uploads
  app.post('/upload', upload.single('file'), function (req, res) {
    if (!req.file) {
      res.status(400).send('No file was uploaded'); // Handle case where no file was uploaded
      return;
    }

    console.log(req.file); // Log the uploaded file details
    // Generate the URL for the uploaded file
    const imageUrl = `http://localhost:3000/public/${req.file.filename}`;
    console.log(imageUrl);
    res.send({ link: imageUrl }); // Send the file URL as the response
  });

  // Start the server and listen on port 3000
  app.listen(3000, () => {
    console.log('Server listening on port 3000');
  });
}

// Call the main function to start the server and set up routes
mainIndexHtml(); // Ensure this call is after the function definition
