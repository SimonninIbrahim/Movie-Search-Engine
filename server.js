const express = require('express');
const nunjucks = require('nunjucks');
const app = express();
const cookieParser = require('cookie-parser');
const articleModel = require('./models/article_model.js');
const { escape, unescape } = require('html-escaper');
const path = require('path')
app.use(express.static('public'));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const multer = require('multer');

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, './public/')
//   },
//   filename: (req, file, cb) => {
//     console.log(file)
//     cb(null, Date.now() + path.extname(file.originalname))
//   }
// })
const upload = multer({ dest: 'public/' });

async function mainIndexHtml() {
  const db = await articleModel.openConnectionToDB();



  //initilize server
  app.get('/', async (req, res) => {

    //locate and initilizde template
    nunjucks.configure('views', {
      autoescape: false,
      express: app
    });

    //decode the text-html tags into actual html tags. (unescape)
    let articles = await db.all('SELECT * FROM articles');

    //render resulting html and send it 
    const html = nunjucks.render('index.html', { articles });
    res.send(html);
  });



  //initilize server
  app.get('/article.html/:id', async (req, res) => {

    let retrivedLanguage = req.cookies.lang
    console.log(`/article retrieved language is ${retrivedLanguage}`)

    //locate and initilizde template
    nunjucks.configure('views', {
      autoescape: false,
      express: app
    });




    let article = await articleModel.getArticleDetail(req.params.id);
    article.content = await unescape(article.content);
    article.arabicContent = await unescape(article.arabicContent);

    // console.log(article);

    const html = nunjucks.render('article.html', { article: article, retrivedLanguage: retrivedLanguage });
    res.send(html);


  });

  app.get('/new_article.html', async (req, res) => {

    //locate and initilizde template
    nunjucks.configure('views', {
      autoescape: false,
      express: app
    });

    let article = {}
    const html = nunjucks.render('new_article.html', article);
    res.send(html);
  });

  app.get('/edit/:id', async (req, res) => {

    // console.log("app.get(/ edit/:id");

    nunjucks.configure('views', {
      autoescape: false,
      express: app
    });
    let article;

    try {
      article = await articleModel.getArticleDetail(req.params.id);
      article.content = unescape(article.content);

    }


    catch (error) {
      if (error instanceof TypeError) {
        console.log(req.headers.referer)
        let URL = (req.headers.referer).split("/");

        let articleId = URL[URL.length - 1];
        console.log('article id ')
        console.log(articleId)
        article = await articleModel.getArticleDetail(articleId);
        article.content = unescape(article.content);


      }
    }



    const html = nunjucks.render('new_article.html', { article });
    res.send(html);

  });

  app.post('/edit/:id', async (req, res) => {

    // console.log('update article invoked');

    // console.log(req.body.id);
    // console.log(req.body.title);
    // console.log(req.body.description);
    // console.log(req.body.content);
    // console.log(req.body.author);
    // console.log(req.body.likes);

    // console.log(req.body.arabicContent);

    // //get the unchanged details
    originalArticle = await articleModel.getArticleDetail(req.params.id);

    // console.log(originalArticle);
    editedArticle = {

      id: originalArticle.id,
      title: req.body.title,
      description: req.body.description,
      content: req.body.content,
      author: req.body.author,
      likes: originalArticle.likes,
      arabicContent: req.body.arabicContent
    }


    // console.log('from withing the post edit')
    // console.log(editedArticle)
    result = await articleModel.updateArticle(req.params.id, editedArticle);

    // console.log(JSON.stringify(result));
    res.send(JSON.stringify(result));

  });



  // language cookie
  app.get('/lang', async (req, res) => {

    console.log(req.query.lang)

    if (req.query.lang == 'ar') {
      console.log('arabic page is being requested')
      let language = 'en';

      let date = new Date();
      date.setMonth(date.getMonth() + 1);
      res.cookie('lang', language, { expires: date });

      res.send('Cookie set!');

    }

    if (req.query.lang == null || req.query.lang == 'en') {

      console.log('english page is being requested')

      let language = 'ar';

      let date = new Date();
      date.setMonth(date.getMonth() + 1);
      res.cookie('lang', language, { expires: date });

      res.send('Cookie set!');

    }



  });

  app.post('/new', async (req, res) => {

    console.log('post new invoked');
    console.log(req.body);

    articleSumbitted = req.body;

    processedArticle = {

      id: (Math.floor(Math.random() * (99999999 - 10 + 1)) + 10),
      title: articleSumbitted.title,
      description: articleSumbitted.description,
      content: articleSumbitted.content,
      author: articleSumbitted.author,
      likes: 0,
      arabicContent: articleSumbitted.arabicContent
    }

    result = await articleModel.addArticle(processedArticle);

    // console.log(JSON.stringify(result));
    res.send(JSON.stringify(result));

  });

  app.delete('/article.html/:id/delete', async (req, res) => {


    let result = await articleModel.deleteArticle(req.params.id);
    // let articlesFromDb = await db.all('DELETE FROM articles WHERE id = ?', req.params.id);

    res.send(JSON.stringify(result));

  });


  app.put('/article.html/:id/like', async (req, res) => {


    let result = await articleModel.likeArticle(req.params.id);

    // console.log(JSON.stringify(result));
    res.send(JSON.stringify(result));

  });


  app.post('/upload', upload.single('file'), function (req, res) {
    if (!req.file) {
      // Handle the error here
      res.status(400).send('No file was uploaded');
      return;
    }

    // Return data.
    console.log(req.file)
    const imageUrl = `http://localhost:3000/public/${req.file.filename}`;
    console.log(imageUrl)
    res.send({ link: imageUrl });
  });


  app.listen(3000, () => {
    console.log('Server listening on port 3000');
  });

}

mainIndexHtml(); 