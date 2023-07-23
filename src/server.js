// Importar módulo express
const express = require('express');

// Desestructuración para importar funciones de connection_db.js.
const { desconnectDB, connectToCollection, generateCode } = require('../connection_db.js');

// creo una instancia del servidor Express.
const server = express();

// Mensajes de respuestas códigos HTTP
const messageMissingData = JSON.stringify({message: 'Faltan datos relevantes'});
const messageNotFound = JSON.stringify({message: 'El código no corresponde a un mueble registrado'});
const messageErrorServer = JSON.stringify({ message: 'Se ha generado un error en el servidor' });

// Middleware que habilita el análisis de solicitudes entrantes en formato JSON.
server.use(express.json());

// Middleware que habilita el análisis de solicitudes entrantes codificadas en URL.
server.use(express.urlencoded({extended: true}));

// Middleware para validar y convertir valores numéricos
const validateNumericFields = ((req, res, next) => {
    const { precio } = req.body;
    const { codigo } = req.params;

    // Validación de precio numérico
    if (precio && isNaN(Number(precio))) {
        return res.status(400).send(JSON.stringify({message: 'El precio debe ser un número válido.'}));
    }
    req.precioNumber = Number(precio);
    req.codigoNumber = Number(codigo);

    next();
});

// Obtener todos los muebles
server.get('/api/v1/muebles', async (req, res) => {
    const {categoria, precio_gte, precio_lte} = req.query;
    const categoriaRegex = { $regex: categoria, $options: 'i' };
    const precio_gte_Number = Number(precio_gte);
    const precio_lte_Number = Number(precio_lte);
    let muebles = [];

    try {
        const collection = await connectToCollection('muebles');

        if (categoria) muebles = await collection.find({categoria: categoriaRegex }).sort({nombre: 1}).toArray();

        else if (precio_gte) muebles = await collection.find({ precio: { $gte: precio_gte_Number } }).sort({ precio: 1 }).toArray();


        else if (precio_lte) muebles = await collection.find({precio: {$lte: precio_lte_Number}}).sort({precio: -1}).toArray();


        else muebles = await collection.find().toArray();

        res.status(200).send(JSON.stringify({payload: muebles}));
    } catch (error) {
        console.log(error.message);
        res.status(500).send(messageErrorServer);
    } finally {
        await desconnectDB();
    }
});

// Obtener un mueble por código
server.get('/api/v1/muebles/:codigo', validateNumericFields, async (req, res) => {
    try {
        const collection = await connectToCollection('muebles');
        const mueble = await collection.findOne({codigo: req.codigoNumber});
        if (!mueble) return res.status(400).send(messageNotFound);
        res.status(200).send(JSON.stringify({payload: mueble}));
    } catch (error) {
        console.log(error.message);
        res.status(500).send(messageErrorServer);
    } finally {
        await desconnectDB();
    }
});

// Crear mueble.
server.post('/api/v1/muebles', validateNumericFields, async (req, res) => {
    const { nombre, precio, categoria } = req.body;

    // Validación de campos requeridos
    if (!nombre || !precio || !categoria) {
        return res.status(400).send(messageMissingData);
    }

    try {
        const collection = await connectToCollection('muebles');
        const mueble = {codigo: await generateCode(collection),
            nombre,
            precio: req.precioNumber,
            categoria};
        await collection.insertOne(mueble);
        res.status(201).send(JSON.stringify({message: 'Registro creado', payload: mueble}));
    } catch (error) {
        console.log(error.message);
        res.status(500).send(messageErrorServer);
    } finally {
        await desconnectDB();
    }
});

// Actualizar datos de un mueble por código
server.put('/api/v1/muebles/:codigo', validateNumericFields, async(req, res) => {
    const {nombre, precio, categoria} = req.body;

    // Validación de campos requeridos
    if (!nombre || !precio || !categoria) return res.status(400).send(messageMissingData);

    // Validación de precio positivo
    if (req.precioNumber <= 0) {
        return res.status(400).send(JSON.stringify({message: 'El precio debe ser un número positivo.'}));
    }

    try {
        const collection = await connectToCollection('muebles');
        let mueble = await collection.findOne({codigo: {$eq: req.codigoNumber}});
        if (!mueble) {
            return res.status(400).send(messageNotFound);
        }

        mueble = {
            codigo: req.codigoNumber,
            nombre,
            precio: req.precioNumber,
            categoria
        };

        await collection.updateOne({codigo: req.codigoNumber}, { $set: mueble});
        res.status(200).send(JSON.stringify({message: 'Registro actualizado', payload: mueble}));
    } catch (error) {
        console.log(error.message);
        res.status(500).send(messageErrorServer);
    } finally {
        await desconnectDB();
    }
});

// Borrar una mueble por código.
server.delete('/api/v1/muebles/:codigo', validateNumericFields, async (req, res) => {
    try {
        const collection = await connectToCollection('muebles');
        const mueble = await collection.findOne({codigo: {$eq: req.codigoNumber}});

        if (!mueble) {
            res.status(400).send(messageNotFound);
        } else {
            await collection.deleteOne({ codigo: {$eq: req.codigoNumber }});
            res.status(200).send(JSON.stringify({message: 'Registro eliminado'}));
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send(messageErrorServer);
    } finally {
        await desconnectDB();
    }
});

// Control de rutas inexistentes.
server.use('*', (req, res) => {
    res.status(404).send(`<h1>Error 404</h1><h3>La URL indicada no existe en este servidor</h3>`);
});

// Método oyente de peteciones.
server.listen(process.env.SERVER_PORT, process.env.SERVER_HOST, () => {
    console.log(`Ejecutandose en http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/api/v1/muebles`);
});