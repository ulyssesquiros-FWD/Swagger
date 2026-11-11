const { AppError } = require('../utils/errors');

/**
 * Almacenamiento en memoria para las notas.
 */
let notas = [];
let nextId = 1;

/**
 * Obtiene todas las notas registradas en memoria.
 * @returns {Array<Object>} Lista de notas
 */
const listar = () => {
  return [...notas];
};

/**
 * Busca una nota por su identificador numérico.
 * Reutilizable tanto por la ruta de consulta como por la de generación de resumen.
 * @param {number|string} id - Identificador de la nota
 * @returns {Object} Nota encontrada
 * @throws {AppError} Si la nota no existe (HTTP 404)
 */
const buscar = (id) => {
  const numericId = Number(id);
  const nota = notas.find((item) => item.id === numericId);

  if (!nota) {
    throw new AppError(`Nota con ID ${id} no encontrada`, 404);
  }

  return nota;
};

/**
 * Crea una nueva nota y genera automáticamente su ID.
 * @param {Object} datos - Objeto con titulo y contenido
 * @returns {Object} Nota creada
 */
const crear = ({ titulo, contenido }) => {
  const nuevaNota = {
    id: nextId++,
    titulo: titulo.trim(),
    contenido: contenido.trim()
  };

  notas.push(nuevaNota);
  return nuevaNota;
};

/**
 * Elimina una nota por su ID.
 * @param {number|string} id - Identificador de la nota
 * @returns {boolean} True si se eliminó exitosamente
 * @throws {AppError} Si la nota no existe (HTTP 404)
 */
const eliminar = (id) => {
  const numericId = Number(id);
  const index = notas.findIndex((item) => item.id === numericId);

  if (index === -1) {
    throw new AppError(`Nota con ID ${id} no encontrada`, 404);
  }

  notas.splice(index, 1);
  return true;
};

/**
 * Reinicia el estado en memoria (útil para pruebas unitarias).
 */
const reiniciar = () => {
  notas = [];
  nextId = 1;
};

module.exports = {
  listar,
  buscar,
  crear,
  eliminar,
  reiniciar
};
