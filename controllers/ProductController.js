import Product from "../Schemas/Product.js";

export async function listarProdutos(request, response) {
  try {
    const products = await Product.find().populate("idOwner", "name email");

    if (!products || products.length === 0) {
      return response
        .status(404)
        .json({ message: "Nenhum produto encontrado!" });
    }

    return response.json(products);
  } catch (error) {
    return response.status(500).json({
      message: "Erro interno:",
      error: error.message,
    });
  }
}

export async function cadastrarProdutos(request, response) {
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
      return response.status(400).json({ message: "Id do usuário inválido." });
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
}

export async function buscarProdutoID(request, response) {
  const id = request.params.id;
  try {
    const products = await ProductSchema.findById(id);

    if (!products) {
      return response
        .status(404)
        .json({ message: "Nenhum produto encontrado!" });
    }

    return response.json(products);
  } catch (error) {
    return response.status(500).json({
      message: "Erro interno:",
      error: error,
    });
  }
}

export async function deletarProduto(request, response) {
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
}

export async function editarProduto(request, response) {
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

    return response.status(200).json({ message: "Seu produto foi editado!" });
  } catch (error) {
    return response.status(500).json({
      message: "Erro interno:",
      error: error,
    });
  }
}
