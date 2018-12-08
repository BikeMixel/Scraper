const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ArticleSchema = new Schema({
  title: {
    type: String,
    unique: true,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  image: {
      type: String,
      required: true
  },
  summary: {
      type: String,
      required: true
  },
  timestamp: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

const Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;