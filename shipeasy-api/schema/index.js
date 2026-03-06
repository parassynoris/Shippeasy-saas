const { registerSchemas } = require('./helpers');
const rawSchemas = require('./schema');

module.exports = registerSchemas(rawSchemas);
