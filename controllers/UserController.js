import User from "../Schemas/User.js";

export async function Register(request, response) {
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
    return response.status(400).json({ message: "O endereço é obrigatório" });
  }
  if (!body.phoneNumber) {
    return response.status(400).json({ message: "O telefone é obrigatório" });
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
}

export async function deleteUser(request, response) {
  const id = request.params.id;

  try {
    const user = await userSchema.findById(id);
    if (!user) {
      return response.status(404).json({ message: "Usuário não encontrado!" });
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
}

export async function Login(request, response) {
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
}

export async function listarUser(request, response) {
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
}
