import mongoose from "mongoose";

import { Schema, Model, model } from "mongoose";

const rentModel = new Schema({
  duration: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  idOwner:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
  },
  idUser:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
  },
  idProduct:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', 
  },
  startDate:{
    type: Date,
    required: true
  }
});

export default model("Rent", rentModel);
