const fs = require('fs');

function leerArchivo(path) {
    try {
        const data = fs.readFileSync(path);
        const objetoJson = JSON.parse(data);
        return objetoJson.todos;
    } catch (error) {
        console.error('Error al leer el archivo:', error);
        return null; // Devuelve null en caso de error
    }
}

function escribirArchivo(path, info) {
    const data = JSON.stringify({todos: info});
    fs.writeFileSync(path, data);
}

function obtenerProximoId(dbData) {
    const lamparas = dbData.todos.Lamparas;
    const ultimoId = lamparas.reduce((maxId, lampara) => Math.max(maxId, lampara.id), 0);
    return ultimoId + 1;
}

module.exports = {
    leerArchivo,
    escribirArchivo,
    obtenerProximoId
};