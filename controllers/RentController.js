import Rent from "../Schemas/Rent.js";

export async function createRent(request, response) {
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
      return response.status(404).json({ message: "Produto não encontrado!" });
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
}
