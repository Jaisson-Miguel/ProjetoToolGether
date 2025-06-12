import bcrypt from "bcrypt";
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import userSchema from "./Schemas/User.js";
import ProductSchema from "./Schemas/Product.js";
import rentSchema from "./Schemas/Rent.js";
import conn from "./db/conn.js";

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
        return response
          .status(400)
          .json({ message: "O endereço é obrigatório" });
      }
      if (!body.phoneNumber) {
        return response
          .status(400)
          .json({ message: "O telefone é obrigatório" });
      }

      try {
        const emailExist = await userSchema.findOne({ email: body.email });
        if (emailExist) {
          return response
            .status(400)
            .json({ message: "Esse email já está em uso" });
        }

        const cryptedPassword = bcrypt.hashSync(body.password, 8);

        const user = await userSchema.create({
          name: body.name,
          email: body.email,
          password: cryptedPassword,
          adress: body.adress,
          phoneNumber: body.phoneNumber,
        });

        const token = jwt.sign({ userId: user._id }, SECRET_KEY, {
          expiresIn: "1h",
        });

        return response.status(201).json({
          message: "Seu usuário foi criado",
          token: token,
          name: user.name,
        });
      } catch (error) {
        return response.status(500).json({
          message: "Erro ao cadastrar usuário",
          error: error.message || "Erro desconhecido",
        });
      }
    });

    app.delete("/deleteUser/:id", async (request, response) => {
      const id = request.params.id;

      try {
        const user = await userSchema.findById(id);
        if (!user) {
          return response
            .status(404)
            .json({ message: "Usuário não encontrado!" });
        }

        await userSchema.findByIdAndDelete(id);

        return response
          .status(200)
          .json({ message: "Usuário deletado com sucesso!" });
      } catch (error) {
        return response.status(500).json({
          message: "Erro ao tentar deletar o usuário",
          error: error.message,
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
          return response
            .status(404)
            .json({ message: "E-mail não encontrado" });
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

    app.get("/getAllUsers", async (request, response) => {
      try {
        const userExists = await userSchema.find();

        if (!userExists || userExists.length === 0) {
          return response
            .status(400)
            .json({ message: "Nenhum usuário encontrado!" });
        }

        return response.json(userExists);
      } catch (error) {
        return response.status(500).json({
          message: "Erro interno:",
          error: error.message || "Erro desconhecido",
        });
      }
    });

    app.post("/product", async (request, response) => {
      const body = request.body;

      if (
        !body.name ||
        !body.description ||
        !body.price ||
        !body.url ||
        !body.manufacturer ||
        !body.idOwner
      ) {
        return response
          .status(400)
          .json({ message: "Campos obrigatórios estão faltando!" });
      }

      try {
        const isValidId = validarId(body.idOwner);
        if (!isValidId) {
          return response
            .status(400)
            .json({ message: "Id do usuário inválido." });
        }

        const product = await ProductSchema.create({
          name: body.name,
          description: body.description,
          price: body.price,
          url: body.url,
          manufacturer: body.manufacturer,
          idOwner: body.idOwner,
        });

        return response.status(201).json({
          message: "Produto criado com sucesso!",
          product,
        });
      } catch (error) {
        return response.status(500).json({
          message: "Erro ao criar o produto",
          error: error.message,
        });
      }
    });

    app.get("/getproducts", async (request, response) => {
      try {
        const products = await ProductSchema.find().populate(
          "idOwner",
          "name email"
        );

        if (!products || products.length === 0) {
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
        const products = await ProductSchema.findById(id);

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
        return response
          .status(204)
          .json({ message: "Seu produto foi excluído!" });
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

      try {
        await ProductSchema.findByIdAndUpdate(id, {
          name: body.name,
          description: body.description,
          price: body.price,
          url: body.url,
          manufacturer: body.manufacturer,
        });

        return response
          .status(200)
          .json({ message: "Seu produto foi editado!" });
      } catch (error) {
        return response.status(500).json({
          message: "Erro interno:",
          error: error,
        });
      }
    });

    app.post("/createRent/:idUser/:idProduct", async (request, response) => {
      const body = request.body;
      const idUser = request.params.idUser;
      const idProduct = request.params.idProduct;

      if (!body.duration) {
        return response
          .status(400)
          .json({ message: "O tempo de aluguel é obrigatório" });
      }

      if (!validarId(idUser)) {
        return response
          .status(404)
          .json({ message: "Id do usuário não é válido!" });
      }
      if (!validarId(idProduct)) {
        return response
          .status(404)
          .json({ message: "Id do produto não é válido!" });
      }

      try {
        const produto = await ProductSchema.findById(idProduct);

        if (!produto) {
          return response
            .status(404)
            .json({ message: "Produto não encontrado!" });
        }

        await rentSchema.create({
          duration: body.duration,
          price: body.price,
          idUser: idUser,
          idProduct: idProduct,
          idOwner: produto.idOwner,
          startDate: body.startDate,
        });

        return response
          .status(200)
          .json({ message: "O aluguel foi agendado com sucesso" });
      } catch (error) {
        return response.status(500).json({
          message: "Erro interno:",
          error: error,
        });
      }
    });
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
