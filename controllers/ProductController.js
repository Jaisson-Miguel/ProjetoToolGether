// ✅ Caminho correto para o schema (ajuste se necessário)
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
