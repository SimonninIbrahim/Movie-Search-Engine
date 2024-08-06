const express = require('express');
const nunjucks = require('nunjucks');
const app = express();
const cookieParser = require('cookie-parser');
const articleModel = require('./models/article_model.js');
const { escape, unescape } = require('html-escaper');
const path = require('path');
const multer = require('multer');

app.use(express.static('public'));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const upload = multer({ dest: 'public/' });

async function mainIndexHtml() {
  const db = await articleModel.openConnectionToDB();

  // Route for home page
  app.get('/', async (req, res) => {
    nunjucks.configure('views', {
      autoescape: false,
      express: app
    });

    let movieSearchResult = await db.all('SELECT * FROM MovRec_movie');
    const html = nunjucks.render('index.html', { movieSearchResult });
    res.send(html);
  });

  // Route for "Short" genre
  app.get('/short', async (req, res) => {
    nunjucks.configure('views', {
      autoescape: false,
      express: app
    });

    try {
      let movieSearchResult = await articleModel.getAllMoviesByGenre(['Short']);
      const html = nunjucks.render('index.html', { movieSearchResult });
      res.send(html);
    } catch (error) {
      console.error("Error fetching short movies:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Route for "Animation" genre
  app.get('/animation', async (req, res) => {
    nunjucks.configure('views', {
      autoescape: false,
      express: app
    });

    try {
      let movieSearchResult = await articleModel.getAllMoviesByGenre(['Animation']);
      const html = nunjucks.render('index.html', { movieSearchResult });
      res.send(html);
    } catch (error) {
      console.error("Error fetching animation movies:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Route for "Documentary" genre
  app.get('/documentary', async (req, res) => {
    nunjucks.configure('views', {
      autoescape: false,
      express: app
    });

    try {
      let movieSearchResult = await articleModel.getAllMoviesByGenre(['Documentary']);
      const html = nunjucks.render('index.html', { movieSearchResult });
      res.send(html);
    } catch (error) {
      console.error("Error fetching documentary movies:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Route for combined genres: Animation & Comedy
  app.get('/animation-comedy', async (req, res) => {
    nunjucks.configure('views', {
      autoescape: false,
      express: app
    });

    try {
      let movieSearchResult = await articleModel.getAllMoviesByGenre(['Animation', 'Comedy']);
      const html = nunjucks.render('index.html', { movieSearchResult });
      res.send(html);
    } catch (error) {
      console.error("Error fetching animation and comedy movies:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Route for article details
  app.get('/article.html/:id', async (req, res) => {
    let retrievedLanguage = req.cookies.lang;
    console.log(`/article retrieved language is ${retrievedLanguage}`);

    nunjucks.configure('views', {
      autoescape: false,
      express: app
    });

    let article = await articleModel.getArticleDetail(req.params.id);
    article.content = unescape(article.content);
    article.arabicContent = unescape(article.arabicContent);

    const html = nunjucks.render('article.html', { article, retrievedLanguage });
    res.send(html);
  });

  app.get('/new_article.html', async (req, res) => {
    nunjucks.configure('views', {
      autoescape: false,
      express: app
    });

    const article = {};
    const html = nunjucks.render('new_article.html', article);
    res.send(html);
  });

  app.get('/edit/:id', async (req, res) => {
    nunjucks.configure('views', {
      autoescape: false,
      express: app
    });

    try {
      let article = await articleModel.getArticleDetail(req.params.id);
      article.content = unescape(article.content);
      const html = nunjucks.render('new_article.html', { article });
      res.send(html);
    } catch (error) {
      if (error instanceof TypeError) {
        console.log(req.headers.referer);
        let URL = req.headers.referer.split("/");
        let articleId = URL[URL.length - 1];
        console.log('article id ', articleId);
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

  app.post('/edit/:id', async (req, res) => {
    originalArticle = await articleModel.getArticleDetail(req.params.id);

    editedArticle = {
      id: originalArticle.id,
      title: req.body.title,
      description: req.body.description,
      content: req.body.content,
      author: req.body.author,
      likes: originalArticle.likes,
      arabicContent: req.body.arabicContent
    }

    result = await articleModel.updateArticle(req.params.id, editedArticle);
    res.send(JSON.stringify(result));
  });

  app.delete('/article.html/:id/delete', async (req, res) => {
    let result = await articleModel.deleteArticle(req.params.id);
    res.send(JSON.stringify(result));
  });

  app.put('/article.html/:id/like', async (req, res) => {
    let result = await articleModel.likeArticle(req.params.id);
    res.send(JSON.stringify(result));
  });

  app.post('/upload', upload.single('file'), function (req, res) {
    if (!req.file) {
      res.status(400).send('No file was uploaded');
      return;
    }

    console.log(req.file);
    const imageUrl = `http://localhost:3000/public/${req.file.filename}`;
    console.log(imageUrl);
    res.send({ link: imageUrl });
  });

  app.listen(3000, () => {
    console.log('Server listening on port 3000');
  });
}

mainIndexHtml(); // Ensure this call is after the function definition
