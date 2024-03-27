const express = require('express');
const nodemailer = require('nodemailer');

const { leerArchivo, escribirArchivo, obtenerProximoId } = require('./src/files');

const app = express();
app.use(express.json());

// Configuración de nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'jaomp3@gmail.com',
        pass: 'greq qmaf qafw nsjn'
    }
});

// RUTAS
app.get('/', (req, res) => {
    res.send('¡Bienvenido a mi aplicación!');
});

app.get('/todos', (req, res) =>{
    try {
        // Leer archivo
        const dbData = leerArchivo('./db.json');
        if (dbData) {
            const lamparas = dbData.todos.Lamparas; // Accede al arreglo de lamparas
            res.send(lamparas); // Envía el arreglo de lamparas como respuesta
            res.printJson(lamparas);
        } else {
            res.status(500).send('Error al leer el archivo');
        }
    } catch (error) {
        console.error('Error al obtener todos:', error);
        res.status(500).send('Error interno del servidor');
    }
});

app.get('/todos/:id', (req, res) =>{
    try {
        const { id } = req.params; // Obtiene el parámetro de la URL
        const dbData = leerArchivo('./db.json');
        
        if (dbData) {
            const lamparas = dbData.todos.Lamparas;
            const lampara = lamparas.find(lampara => lampara.id == id); // Busca la lámpara por su ID
            
            if (lampara) {
                res.send(lampara); // Envía los detalles de la lámpara encontrada
            } else {
                res.status(404).send('Lámpara no encontrada'); // Si no se encuentra la lámpara, devuelve un error 404
            }
        } else {
            res.status(500).send('Error al leer el archivo');
        }
    } catch (error) {
        console.error('Error al obtener la lámpara:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// RUTA: Agregar una nueva lámpara
app.post('/todos', (req, res) => {
    try {
        const dbData = leerArchivo('./db.json');
        const nuevaLampara = req.body; // Obtiene la nueva lámpara desde el cuerpo de la solicitud
        
        if (dbData && nuevaLampara) {
            const lamparas = dbData.todos.Lamparas;
            const proximoId = obtenerProximoId(dbData);
            nuevaLampara.id = proximoId;
            lamparas.push(nuevaLampara);
            escribirArchivo('./db.json', dbData);
            res.status(201).send('Lámpara agregada correctamente');
        } else {
            res.status(400).send('Datos de la lámpara no proporcionados');
        }
    } catch (error) {
        console.error('Error al agregar la lámpara:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// RUTA: Actualizar los detalles de una lámpara por su ID
app.put('/todos/:id', (req, res) => {
    try {
        const { id } = req.params;
        const dbData = leerArchivo('./db.json');
        const lamparaActualizada = req.body;

        console.log(dbData);
        
        if (dbData && lamparaActualizada) {
            const lamparas = dbData.todos.Lamparas;
            console.log(lamparas);

            const indiceLampara = lamparas.findIndex(lampara => lampara.id == id);
            
            if (indiceLampara !== -1) {
                lamparas[indiceLampara] = { ...lamparas[indiceLampara], ...lamparaActualizada };
                escribirArchivo('./db.json', dbData);
                res.send('Lámpara actualizada correctamente');
            } else {
                res.status(404).send('Lámpara no encontrada');
            }
        } else {
            res.status(400).send('Datos de la lámpara no proporcionados');
        }
    } catch (error) {
        console.error('Error al actualizar la lámpara:', error);
        res.status(500).send('Error interno del servidor');
    }
});

app.delete('/todos/:id', (req, res) => {
    try {
        const { id } = req.params;
        const dbData = leerArchivo('./db.json');
        
        if (dbData) {
            const lamparas = dbData.todos.Lamparas;
            const indiceLampara = lamparas.findIndex(lampara => lampara.id == id);
            
            if (indiceLampara !== -1) {
                lamparas.splice(indiceLampara, 1);
                escribirArchivo('./db.json', dbData);
                res.send('Lámpara eliminada correctamente');
                const mailOptions = {
                    from: 'jaomp3@gmail.com', // Remitente
                    to: 'julian.osorio37772@ucaldas.edu.co', // Destinatario
                    subject: 'Objero eliminado de db.json', // Asunto
                    text: 'se ha eliminado un objeto del sb.json.' // Cuerpo del correo
                };
            
                // Envío del correo electrónico
                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                        console.error('Error al enviar el correo electrónico:', error);
                        res.status(500).send('Error al enviar el correo electrónico');
                    } else {
                        console.log('Correo electrónico enviado:', info.response);
                        res.send('Correo electrónico enviado correctamente');
                    }
                });
            } else {
                res.status(404).send('Lámpara no encontrada');
            }
        } else {
            res.status(500).send('Error al leer el archivo');
        }
    } catch (error) {
        console.error('Error al eliminar la lámpara:', error);
        res.status(500).send('Error interno del servidor');
    }
}); 

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Error interno del servidor');
});
app.get('/enviar-correo', (req, res) => {
    // Detalles del correo electrónico
    const mailOptions = {
        from: 'jaomp3@gmail.com', // Remitente
        to: 'julian.osorio37772@ucaldas.edu.co', // Destinatario
        subject: 'Prueba de correo desde Node.js', // Asunto
        text: 'Este es un correo de prueba enviado desde Node.js usando nodemailer.' // Cuerpo del correo
    };

    // Envío del correo electrónico
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.error('Error al enviar el correo electrónico:', error);
            res.status(500).send('Error al enviar el correo electrónico');
        } else {
            console.log('Correo electrónico enviado:', info.response);
            res.send('Correo electrónico enviado correctamente');
        }
    });
});

// Iniciar el servidor
app.listen(3000, () => {
    console.log('Escuchando en el puerto 3000');
});