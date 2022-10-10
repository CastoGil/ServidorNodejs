const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const fs = require("fs");

class Contenedor {
  constructor(archivo) {
    this.nombre = archivo;
  }
  //validamos si tenemos el json creado
  async validateExistFile() {
    try {
      await fs.promises.stat(this.nombre);
    } catch (err) {
      await fs.promises.writeFile(this.nombre, JSON.stringify([]));
    }
  }
  //leemos la informacion en el json en general
  async readData() {
    this.validateExistFile();
    try {
      const contenido = await fs.promises.readFile(this.nombre, "utf-8");
      return JSON.parse(contenido);
    } catch (error) {
      console.log("error", error);
    }
  }
  async saveObject(products) {
    this.validateExistFile();
    await fs.promises.writeFile(
      this.nombre,
      JSON.stringify(products, null, "\t")
    );
  }
  async save(object) {
    const arrayObject = await this.readData();
    let id;
    arrayObject.length === 0
      ? (id = 1)
      : (id = arrayObject[arrayObject.length - 1].id + 1);

    const newObject = {
      title: object.title,
      price: object.price,
      id: id,
    };
    arrayObject.push(newObject);
    await this.saveObject(arrayObject);
  }
  async getAll() {
    const arrayObject = await this.readData();
    return arrayObject;
  }
  async deleteAll() {
    const borrado = [];
    await this.saveObject(borrado);
    return borrado;
  }
  async getById(number) {
    const arrayObject = await this.readData();
    const encontrarId = (encontrar) => (encontrar.id === number ? true : false);
    const indice = arrayObject.findIndex(encontrarId);
    indice === -1 ? console.log("el producto no existe") : arrayObject[indice];
    return arrayObject[indice];
  }
  async deleteById(number) {
    const arrayObject = await this.readData();
    const buscarObject = arrayObject.filter((buscar) => buscar.id !== number);
    await this.saveObject(buscarObject);
  }
}

const contenedor = new Contenedor("express.json");
//contenedor.validateExistFile();
//contenedor.readData();
//contenedor.getAll();
//contenedor.save({ title: "marcador", price: "325" });
//si llamamos a deleteAll nos borra todos los archivos// descomentar e ir probando..
//contenedor.deleteAll()
//contenedor.getById();
//contenedor.deleteById(24);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//DEFINIENDO LAS RUTAS DE NUESTRO SERVIDOR
app.get("/", async (req, res) => {
  res.send(`<h1>BIENVENIDO A MI SERVIDOR<h1>`);
});

app.get("/productos", async (req, res) => {
  const products = await contenedor.getAll();
  res.send(products);
});

const randomId = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
};

const longitud = async () => {
  const array = await contenedor.readData();
  return array.length;
};
app.get("/productoRandom", async (req, res) => {
  const max = await longitud();
  const id = randomId(1, max);
  const productRandom = await contenedor.getById(id);
  res.send(JSON.stringify(productRandom));
});

const server = app.listen(PORT, () => {
  console.log(`Escuchando en el puerto ${PORT}...`);
});
server.on("error", (error) => {
  console.log(`error en servidor ${error}`);
});
