import bcrypt from "bcrypt";
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import userSchema from "./Schemas/User.js";

import jwtVerify from "./services/jwt-verify.js";

import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY;
mongoose.connect(process.env.URL_DATABASE);

const app = express();

app.use(express.json());

app.get("/", (request, response) => {
  return response.json({ message: "Servidor funcionando! 222" });
});

app.get("/teste", jwtVerify, (request, response) => {
  return response.json({
    message: "Servidor funcionando jaisson hhhhthhhhtttt!",
  });
});

app.get("/login", (request, response) => {
  return response.json({ message: "Vc fez login" });
});
app.listen(3333);

app.post("/register", async (request, response) => {
  const body = request.body;

  if (!body.email) {
    return response.status(400).json({ message: "O email é obrigatório" });
  }
  if (!body.name) {
    return response.status(400).json({ message: "O nome é obrigatório" });
  }
  if (!body.password) {
    return response.status(400).json({ message: "A senha é obrigatória" });
  }
  if (!body.adress) {
    return response.status(400).json({ message: "O endereço é obrigatória" });
  }
  if (!body.phoneNumber) {
    return response.status(400).json({ message: "O telefone é obrigatória" });
  }

  const emailExist = await userSchema.findOne({ email: body.email });
  if (emailExist) {
    return response.status(400).json({ message: "Esse email já está em uso" });
  }
  const cryptedPassword = bcrypt.hashSync(request.body.password, 8);

  try {
    await userSchema.create({
      name: body.name,
      email: body.email,
      password: cryptedPassword,
      adress: body.adress,
      phoneNumber: body.phoneNumber,
    });

    return response.status(201).json({
      message: "Seu usuário foi criado",
      token: TOKEN,
      name: body.name,
    });
  } catch (error) {
    return response.status(500).json({
      message: "Erro ao cadastrar usuário",
      error: error,
    });
  }
});

app.post("/login", async (request, response) => {
  const body = request.body;
  console.log(body.email);
  try {
    if (!body.email || !body.password) {
      return response
        .status(400)
        .json({ message: "E-mail e/ou senha são obrigatório(s)" });
    }

    const userExists = await userSchema.findOne({ email: body.email });

    if (!userExists) {
      return response.status(404).json({ message: "E-mail não encontrado" });
    }

    const isCorrectPassword = bcrypt.compareSync(
      body.password,
      userExists.password
    );

    if (!isCorrectPassword) {
      return response.status(400).json({ message: "Senha inválida" });
    }

    const USER_TOKEN = jwt.sign(
      { id: userExists._id, name: userExists.name },
      SECRET_KEY
    );

    return response.status(200).json({
      usuario: userExists.name,
      email: userExists.email,
      token: USER_TOKEN,
    });
  } catch (error) {
    return response.status(500).json({
      message: "Erro interno: " + error,
    });
  }
});
app.listen(3333, () =>
  console.log("Servidor rodando em http://localhost:3333")
);
