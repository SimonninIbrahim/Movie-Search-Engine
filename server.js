// Import required modules and dependencies
const express = require('express'); // Import Express for building the web server
const nunjucks = require('nunjucks'); // Import Nunjucks for templating
const app = express(); // Create an Express application
const cookieParser = require('cookie-parser'); // Import cookie-parser to parse cookies
const articleModel = require('./models/article_model.js'); // Import custom model for database interactions
const { escape, unescape } = require('html-escaper'); // Import functions to escape and unescape HTML
const path = require('path'); // Import path module for handling file paths
const multer = require('multer'); // Import multer for handling file uploads

// Middleware setup
app.use(express.static('public')); // Serve static files from the 'public' directory
app.use(cookieParser()); // Parse cookies for the request
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(express.json()); // Parse JSON data

// Set up file storage with multer for file uploads
const upload = multer({ dest: 'public/' }); // Set destination for uploaded files

// Main function to initialize the server and routes
async function mainIndexHtml() {
  // Open a connection to the database
  const db = await articleModel.openConnectionToDB();

  // Route for the home page
  app.get('/', async (req, res) => {
    // Configure Nunjucks template engine
    nunjucks.configure('views', {
      autoescape: false,
      express: app
    });

    // Fetch all movies from the database
    let movieSearchResult = await db.all('SELECT * FROM MovRec_movie');
    // Render the 'index.html' template with the fetched movies
    const html = nunjucks.render('index.html', { movieSearchResult });
    res.send(html); // Send the rendered HTML to the client
  });

  // Route for filtering movies by selected genres
  app.get('/genre', async (req, res) => {
    nunjucks.configure('views', {
      autoescape: false,
      express: app
    });

    try {
      // Retrieve selected genres from the query parameters
      let genres = req.query.genres;

      // Ensure genres is an array
      if (!Array.isArray(genres)) {
        genres = [genres];
      }

      // Fetch movies matching the selected genres
      let movieSearchResult = await articleModel.getAllMoviesByGenre(genres);
      // Render the 'index.html' template with the fetched movies
      const html = nunjucks.render('index.html', { movieSearchResult });
      res.send(html); // Send the rendered HTML to the client
    } catch (error) {
      console.error("Error fetching movies by genres:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Route for handling advanced search with various filters
  app.get('/search', async (req, res) => {
    nunjucks.configure('views', {
      autoescape: false,
      express: app
    });

    try {
      // Extract search parameters from the query string
      const filters = {
        genres: req.query.genres ? [].concat(req.query.genres) : [], // Convert to array if not already
        year: req.query.year,
        minRating: req.query.minRating,
        maxRating: req.query.maxRating,
        director: req.query.director,
        cast: req.query.cast,
        country: req.query.country,
        language: req.query.language
      };

      // Fetch movies matching the search criteria
      const movieSearchResult = await articleModel.getMoviesByAttributes(filters);

      // Render the 'index.html' template with the fetched movies
      const html = nunjucks.render('index.html', { movieSearchResult });
      res.send(html); // Send the rendered HTML to the client
    } catch (error) {
      console.error("Error fetching movies by attributes:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Route for displaying article details by ID
  app.get('/article.html/:id', async (req, res) => {
    let retrievedLanguage = req.cookies.lang; // Retrieve language preference from cookies
    console.log(`/article retrieved language is ${retrievedLanguage}`);

    nunjucks.configure('views', {
      autoescape: false,
      express: app
    });

    // Fetch the article details by ID
    let article = await articleModel.getArticleDetail(req.params.id);
    // Unescape HTML content for rendering
    article.content = unescape(article.content);
    article.arabicContent = unescape(article.arabicContent);

    // Render the 'article.html' template with the article details and language preference
    const html = nunjucks.render('article.html', { article, retrievedLanguage });
    res.send(html); // Send the rendered HTML to the client
  });

  // Route for displaying the page to create a new article
  app.get('/new_article.html', async (req, res) => {
    nunjucks.configure('views', {
      autoescape: false,
      express: app
    });

    const article = {}; // Initialize an empty article object
    // Render the 'new_article.html' template for creating a new article
    const html = nunjucks.render('new_article.html', article);
    res.send(html); // Send the rendered HTML to the client
  });

  // Route for editing an existing article by ID
  app.get('/edit/:id', async (req, res) => {
    nunjucks.configure('views', {
      autoescape: false,
      express: app
    });

    try {
      // Fetch the article details by ID
      let article = await articleModel.getArticleDetail(req.params.id);
      // Unescape HTML content for rendering
      article.content = unescape(article.content);
      // Render the 'new_article.html' template with the article details for editing
      const html = nunjucks.render('new_article.html', { article });
      res.send(html); // Send the rendered HTML to the client
    } catch (error) {
      // Handle errors, such as the article ID not being found
      if (error instanceof TypeError) {
        console.log(req.headers.referer);
        let URL = req.headers.referer.split("/");
        let articleId = URL[URL.length - 1];
        console.log('article id ', articleId);
        // Fetch the article details using the last segment of the referer URL as the ID
        let article = await articleModel.getArticleDetail(articleId);
        article.content = unescape(article.content);
        const html = nunjucks.render('new_article.html', { article });
        res.send(html);
      } else {
        console.error("Error fetching article:", error);
        res.status(500).send("Internal Server Error");
      }
    }
  });

  // Route for handling form submission to update an article
  app.post('/edit/:id', async (req, res) => {
    // Fetch the original article details by ID
    originalArticle = await articleModel.getArticleDetail(req.params.id);

    // Prepare the updated article data
    editedArticle = {
      id: originalArticle.id,
      title: req.body.title,
      description: req.body.description,
      content: req.body.content,
      author: req.body.author,
      likes: originalArticle.likes,
      arabicContent: req.body.arabicContent
    }

    // Update the article in the database
    result = await articleModel.updateArticle(req.params.id, editedArticle);
    res.send(JSON.stringify(result)); // Send the update result as JSON
  });

  // Route for deleting an article by ID
  app.delete('/article.html/:id/delete', async (req, res) => {
    // Delete the article from the database
    let result = await articleModel.deleteArticle(req.params.id);
    res.send(JSON.stringify(result)); // Send the deletion result as JSON
  });

  // Route for liking an article by ID
  app.put('/article.html/:id/like', async (req, res) => {
    // Increment the like count for the article
    let result = await articleModel.likeArticle(req.params.id);
    res.send(JSON.stringify(result)); // Send the like result as JSON
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
