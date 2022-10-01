const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: String,
    color: String,
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now()
    },
    updatedAt: {
        type: Date,
        default: () => Date.now()
    }
})

module.exports = mongoose.model('Category', categorySchema);