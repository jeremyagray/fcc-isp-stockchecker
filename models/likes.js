'use strict';

const mongoose = require('mongoose');

// Create a like schema and model.
const likeSchema = new mongoose.Schema(
  {
    stockId: {type: mongoose.ObjectId, required: true},
    ip: {type: String, required: true},
    created: {type: Date, required: true, default: Date.now}
  });

const likeModel = mongoose.model('Like', likeSchema);

module.exports = likeModel;
