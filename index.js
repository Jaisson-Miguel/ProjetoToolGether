import bcrypt from "bcrypt";
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import userSchema from "./Schemas/User.js";
import manufacturerSchema from "./Schemas/Manufacturer.js";
import ProductSchema from "./Schemas/Product.js";

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

app.post("/manufacturer", async (request, response) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({ message: "O nome é obrigatória" });
  }

  try {
    const manufacturerCreated = await manufacturerSchema.create({
      name: body.name,
    });

    return response.status(201).json(manufacturerCreated);
  } catch (error) {
    return response.status(500).json({
      message: "Erro interno:",
      error: error,
    });
  }
});

app.get("/getmanufacturer", async (request, response) => {
  try {
    const fornecedores = await manufacturerSchema.find();

    if (!fornecedores) {
      return response
        .status(400)
        .json({ message: "Nenhum fabricante encontrado!" });
    }

    return response.json(fornecedores);
  } catch (error) {
    return response.status(500).json({
      message: "Erro interno:",
      error: error,
    });
  }
});

app.delete("/deletemanufacturer/:id", async (request, response) => {
  const id = request.params.id;
  if (!id) {
    return response.status(400).json({ message: "O id é obrigatório!" });
  }
  try {
    await manufacturerSchema.deleteOne({ _id: id });
    return response
      .status(204)
      .json({ message: "Seu fabricante foi excluído!" });
  } catch (error) {
    return response.status(500).json({
      message: "Erro interno:",
      error: error,
    });
  }
});

app.put("/editmanufacturer/:id", async (request, response) => {
  const id = request.params.id;
  const body = request.body;

  try {
    await manufacturerSchema.findByIdAndUpdate(id, {
      name: body.name,
    });

    return response
      .status(200)
      .json({ message: "Seu fabricante foi editado!" });
  } catch (error) {
    return response.status(500).json({
      message: "Erro interno:",
      error: error,
    });
  }
});

app.post("/product", async (request, response) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({ message: "O nome é obrigatório" });
  }
  if (!body.description) {
    return response.status(400).json({ message: "A descrição é obrigatória" });
  }
  if (!body.price) {
    return response.status(400).json({ message: "O preço é obrigatório" });
  }
  if (!body.url) {
    return response
      .status(400)
      .json({ message: "O url da imagem é obrigatório" });
  }
  if (!body.manufacturer) {
    return response.status(400).json({ message: "O fabricante é obrigatório" });
  }

  try {
    const manufacturerExists = manufacturerSchema.findById(body.manufacturer);

    if (!manufacturerExists) {
      return response
        .status(404)
        .json({ message: "Fabricante não encontrado!" });
    }

    await ProductSchema.create({
      name: body.name,
      description: body.description,
      price: body.price,
      url: body.url,
      manufacturer: body.manufacturer,
    });
    return response
      .status(200)
      .json({ message: "O produto foi criado com sucesso" });
  } catch (error) {
    return response.status(500).json({
      message: "Erro interno:",
      error: error,
    });
  }
});

app.get("/getproducts", async (request, response) => {
  try {
    const products = await ProductSchema.find({}).populate("manufacturer");

    if (!products) {
      return response
        .status(400)
        .json({ message: "Nenhum produto encontrado!" });
    }

    return response.json(products);
  } catch (error) {
    return response.status(500).json({
      message: "Erro interno:",
      error: error,
    });
  }
});

app.get("/getproductsbyid/:id", async (request, response) => {
  const id = request.params.id;
  try {
    const products = await ProductSchema.findById(id).populate("manufacturer");

    if (!products) {
      return response
        .status(400)
        .json({ message: "Nenhum produto encontrado!" });
    }

    return response.json(products);
  } catch (error) {
    return response.status(500).json({
      message: "Erro interno:",
      error: error,
    });
  }
});

app.delete("/deleteproduct/:id", async (request, response) => {
  const id = request.params.id;
  if (!id) {
    return response.status(400).json({ message: "O id é obrigatório!" });
  }
  try {
    await ProductSchema.deleteOne({ _id: id });
    return response.status(204).json({ message: "Seu produto foi excluído!" });
  } catch (error) {
    return response.status(500).json({
      message: "Erro interno:",
      error: error,
    });
  }
});

app.put("/editproduct/:id", async (request, response) => {
  const id = request.params.id;
  const body = request.body;

  console.log(validarId(body.manufacturer));

  if (validarId(body.manufacturer)) {
    return response.status(404).json({ message: "Id não é válido!" });
  }

  try {
    const manufacturerExists = manufacturer.findById(body.manufacturer);

    if (!manufacturerExists) {
      return response
        .status(404)
        .json({ message: "Fabricante não encontrado!" });
    }

    await ProductSchema.findByIdAndUpdate(id, {
      name: body.name,
      description: body.description,
      price: body.price,
      url: body.url,
      manufacturer: body.manufacturer,
    });

    return response.status(200).json({ message: "Seu produto foi editado!" });
  } catch (error) {
    return response.status(500).json({
      message: "Erro interno:",
      error: error,
    });
  }
});

function validarId(id) {
  var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
  const isIdValid = checkForHexRegExp.test(id);
}
