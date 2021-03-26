const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const informationDB = mongoose.connection.useDb("Information");
const AutoIncrement = require('mongoose-sequence')(mongoose);

let Information = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  imageTop: {
    type: String,
  },
  imageBottom: {
    type: String,
  },
<<<<<<< HEAD
  order: {
    type: Number
  }
=======
  metadataImageTop: {
    type: String,
  },
  metadataImageBottom: {
    type: String,
  },
>>>>>>> master
});
Information.plugin(AutoIncrement, {inc_field: 'order'});
module.exports = informationDB.model("Information", Information, "Information")
