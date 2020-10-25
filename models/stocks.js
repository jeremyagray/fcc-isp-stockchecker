'use strict';

const mongoose = require('mongoose');

// Create a stock schema and model.
const stockSchema = new mongoose.Schema(
  {
    stock: {type: String, required: true},
    price: {type: Number, required: true},
    created: {type: Date, required: true, default: Date.now},
    updated: {type: Date, required: true, default: Date.now}
  });

// Add a virtual to populate comments into their book.
stockSchema.virtual('likes', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'stockId',
  justOne: false
});

const stockModel = mongoose.model('Stock', stockSchema);

module.exports = stockModel;

// exports.Stocks = stockModel;
