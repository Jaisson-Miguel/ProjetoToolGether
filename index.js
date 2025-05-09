import express from "express";

const app = express();

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
