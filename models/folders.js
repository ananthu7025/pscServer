// models/folderModel.js
const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  year: String,
  month: String,
  folderId:String
});

const Folder = mongoose.model('Folder', folderSchema);

module.exports = Folder;
