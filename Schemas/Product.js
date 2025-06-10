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
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Manufacturer",
  },
});

export default model("Product", productModel);
