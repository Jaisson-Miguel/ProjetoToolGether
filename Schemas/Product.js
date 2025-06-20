import mongoose from "mongoose";

import { Schema, Model, model } from "mongoose";

const productModel = new Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  manufacturer: {
    type: String,
    required: true,
  },
  idOwner:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  }
});

export default model("Product", productModel);
