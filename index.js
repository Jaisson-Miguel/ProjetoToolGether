import express, { request, response } from "express";
import mongoose from "mongoose";   
import bcrypt from "bcrypt";
import userSchema from "./Schemas/User.js";

mongoose.connect("mongodb+srv://admin:admin@cluster0.teu70jp.mongodb.net/");

const app = express();
const TOKEN = "71f09f3e-2db7-46c6-97be-d572df7f9116";
app.use(express.json());

app.get("/", (request, response) => {
  return response.json({ message: "Servidor funcionando! 222" });
});

app.get("/teste", (request, response) => {
  return response.json({ message: "Servidor funcionando jaisson hhhhthhhhtttt!" });
});

app.get("/login", (request, response) => {
  return response.json({ message: "Vc fez login" });
});
app.listen(3333);


app.post("/register", async (request, response)=>{
    const body = request.body;

    if(!body.email){
        return response.status(400).json({message:"O email é obrigatório"})
    }
    if(!body.name){
        return response.status(400).json({message:"O nome é obrigatório"})
    }
    if(!body.password){
        return response.status(400).json({message:"A senha é obrigatória"})
    }
    if(!body.adress){
        return response.status(400).json({message:"O endereço é obrigatória"})
    }
    if(!body.phoneNumber){
        return response.status(400).json({message:"O telefone é obrigatória"})
    }

    const emailExist = await userSchema.findOne({email:body.email});
    if(emailExist){
        return response.status(400).json({message:"Esse email já está em uso"});
    }
    const cryptedPassword = bcrypt.hashSync(request.body.password, 8);

    try {
        await userSchema.create({
        name:body.name, 
        email:body.email, 
        password:cryptedPassword,
        adress:body.adress,
        phoneNumber:body.phoneNumber
    });

    return response.status(201).json({
        message:"Seu usuário foi criado",
        token:TOKEN, 
        name:body.name
    });
    } catch (error) {
        return response.status(500).json({
            message:"Erro ao cadastrar usuário",
            error:error
        });
    } 
});

app.post("/login", async (request, response)=>{
    const body = request.body;

    if(!body.email){
        return response.status(400).json({message:"O email é obrigatório"})
    }
    if(!body.password){
        return response.status(400).json({message:"A senha é obrigatória"})
    }

    try{    
        app.post("/login", async (request, response)=>{
            const body = request.body;

            if(!body.email){
                return response.status(400).json({message:"O email é obrigatório"})
            }
            if(!body.password){
                return response.status(400).json({message:"A senha é obrigatória"})
            }

            const userExists = await userSchema.findOne({email:body.email});

            if(!userExists){
                return response.status(404).json({message:"Email não encontrado!"})
            }

            const isCorrectPassword = bcrypt.compareSync(body.password, userExists.password);

            if(!isCorrectPassword){
                return response.status(400).json({message:"Senha incorreta!"})
            }

            return response.status(200).json({usuario: userExists.name, email: userExists.email, token: TOKEN});
        });
    }catch (error) {
        return response.status(500).json({
            message:"Erro interno:",
            error:error 
        });
    } 
});