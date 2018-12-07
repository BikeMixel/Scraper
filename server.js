const express = require('express')
const exphbs = require('express-handlebars')
const mongoose = require('mongoose')
const axios = require('axios')
const cheerio = require('cheerio')
const db = require('./models')

const PORT = 8080 || process.env.PORT

const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static('public'))
app.engine("handlebars", exphbs({ defaultLayout: "main" }))
app.set("view engine", "handlebars")

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/mongoHeadlines' 
mongoose.connect(MONGODB_URI, function() {
    mongoose.connection.db.dropDatabase()
})

// routes 

// / 
app.get('/', (_, res) => {
    res.redirect('/articles')
})

//scraping
app.get('/scraper', (_, res) => {
    axios.get("http://www.espn.com/nfl/team/_/name/cle/cleveland-browns").then(function(response) {
        const $ = cheerio.load(response.data)
            $("article .text-container").each(function(i, element) {
                let result = {}
                    result.title = $(this)
                        .children('.item-info-wrap')
                        .children('h1')
                        .text()
                    result.link = "http://www.espn.com" + $(this)
                        .children('.item-info-wrap')
                        .children('h1')
                        .children('a')
                        .attr('href')
                    result.image = $(this)
                        .parent()
                        .find('img')
                        .attr('data-default-src')   
                    result.summary = $(this)
                        .children('.item-info-wrap')
                        .children('p')
                        .text()
                    db.Article.create(result)
                        .then(function(dbArticle) {
                            console.log('dbArticle ', dbArticle)
                        })
                        .catch(function(err) {
                            console.log('err ', err)
                        })
            })
        res.redirect('/')
    })
})

// all articles
app.get('/articles', (_, res) => {
    db.Article.find({}).sort({ '_id': -1 })
        .exec((err, article) => {
            if (err) {
                throw err
            }
            const art = {article: article}
            res.render('index', art)
        })
        // .then(function(dbArticle) {
        //     res.json(dbArticle)
        // })
        // .catch(function(err) {
        //     res.json(err)
        // })
})

// specific articles 
app.get('/articles/:id', (req, res) => {
    db.Article.findOne({ _id: req.params.id })
    .sort({ '_id': -1 })
    .populate('note')
    .then(function(dbArticle) {
        res.json(dbArticle)
    })
    .catch(function(err) {
        res.json(err)
    })
})

// saving comments
app.post('/articles/:id', (req, res) => {
    db.Note.create(req.body)
        .then(function () {
            return db.Article.findOneAndUpdate({_id: req.body.id}, {note: dbNote._id}, {new: true})
                .then(function(dbArticle) {
                    res.json(dbArticle)
                })
                .catch(function(err) {
                    res.json(err)
                })
        })
})

const database = mongoose.connection
app.listen(PORT, () => console.log('Running on port ', PORT))
database.once('open', function () {
    console.log('Mongoose connection went well')
})


