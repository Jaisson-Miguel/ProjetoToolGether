import bcrypt from "bcryptjs";
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import userSchema from "./Schemas/User.js";
import ProductSchema from "./Schemas/Product.js";
import rentSchema from "./Schemas/Rent.js";
import conn from "./db/conn.js";

import {
  Login,
  Register,
  deleteUser,
  listarUser,
} from "./controllers/UserController.js";

import {
  editarProduto,
  cadastrarProdutos,
  buscarProdutoID,
  deletarProduto,
  listarProdutos,
} from "./controllers/ProductController.js";

import { createRent } from "./controllers/RentController.js";

import jwtVerify from "./services/jwt-verify.js";

import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY;

const startApp = async () => {
  const conectado = await conn();

  if (conectado) {
    console.log("🟢 Servidor pode ser iniciado.");

    const app = express();

    app.use(express.json());

    app.listen(3333, () =>
      console.log("Servidor rodando em http://localhost:3333")
    );

    app.get("/", (request, response) => {
      return response.json({ message: "Servidor funcionando! 222" });
    });

    app.post("/register", Register);

    app.delete("/deleteUser/:id", deleteUser);

    app.post("/login", Login);

    app.get("/getAllUsers", listarUser);

    app.post("/product", cadastrarProdutos);

    app.get("/getproducts", listarProdutos);

    app.get("/getproductsbyid/:id", buscarProdutoID);

    app.delete("/deleteproduct/:id", deletarProduto);

    app.put("/editproduct/:id", editarProduto);

    app.post("/createRent/:idUser/:idProduct", createRent);
  } else {
    console.log("🔴 Aplicação encerrada por erro de conexão.");
    process.exit(1);
  }
};

startApp();

function validarId(id) {
  var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
  return checkForHexRegExp.test(id);
}
