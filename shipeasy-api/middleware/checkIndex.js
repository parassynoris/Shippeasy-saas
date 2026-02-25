
const Schema = require('../schema/schema');

exports.checkIndex = async (req, res, next) => {
    const indexName = req.params.indexName;

    if ((!["logaudit"].includes(indexName)) && Schema.hasOwnProperty(indexName)) {
        next()
    } else {
        res.status(404).json({ message: 'This endpoint has not been registered' });
    }
}