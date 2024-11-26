const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const JSON_PATH = './canciones.json';

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/canciones', (req, res) => {
    fs.readFile(JSON_PATH, 'utf-8', (err, data) => {
        if (err) return res.status(404).send('Error, no se encuentra el listado');
        res.json(JSON.parse(data));
    });
});

app.post('/canciones', (req, res) => {
    const { id, nombre, cantante, tono } = req.body;

    if (!id || !nombre || !cantante || !tono) {
        return res.status(400).send('Todos los campos (id, nombre, cantante, tono) son obligatorios.');
    }

    if (typeof id !== 'number' || typeof nombre !== 'string' || typeof cantante !== 'string' || typeof tono !== 'string') {
        return res.status(400).send('Los tipos de datos de los campos no son válidos.');
    }

    fs.readFile(JSON_PATH, 'utf-8', (err, data) => {
        if (err) return res.status(500).send('No se pudo agregar la canción.');
        const canciones = JSON.parse(data);
        canciones.push({ id, nombre, cantante, tono });
        fs.writeFile(JSON_PATH, JSON.stringify(canciones, null, 2), (err) => {
            if (err) return res.status(500).send('Error guardando la canción');
            res.status(201).send('Canción agregada exitosamente');
        });
    });
});


app.put('/canciones/:id', (req, res) => {
    const { id } = req.params;
    const datosActualizados = req.body;
    fs.readFile(JSON_PATH, 'utf-8', (err, data) => {
        if (err) return res.status(500).send('Error leyendo el archivo');
        let canciones = JSON.parse(data);
        canciones = canciones.map(cancion =>
            cancion.id === parseInt(id) ? { ...cancion, ...datosActualizados } : cancion
        );
        fs.writeFile(JSON_PATH, JSON.stringify(canciones, null, 2), (err) => {
            if (err) return res.status(500).send('Error actualizando la canción');
            res.send('Canción actualizada exitosamente');
        });
    });
});

app.delete('/canciones/:id', (req, res) => {
    const { id } = req.params;
    fs.readFile(JSON_PATH, 'utf-8', (err, data) => {
        if (err) return res.status(500).send('Error leyendo el archivo JSON');
        let canciones = JSON.parse(data);
        canciones = canciones.filter(cancion => cancion.id !== parseInt(id));
        fs.writeFile(JSON_PATH, JSON.stringify(canciones, null, 2), (err) => {
            if (err) return res.status(500).send('Error eliminando la canción');
            res.send('Canción eliminada exitosamente');
        });
    });
});

app.listen(PORT, () => {
    console.log("Servidor corriendo en puerto 3000");
});
