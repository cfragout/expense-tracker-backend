const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    amount: Number,
    date: Date,
    description: String,
    user: String,
    category: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Category'
    },
    subCategories: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Category'
    }],
    currency: String,
    originalAmount: {
        type: Number,
        immutable: true
    },
    originalCurrency: {
        type: String,
        immutable: true
    },
    rates: mongoose.SchemaTypes.Mixed,
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now()
    },
    updatedAt: {
        type: Date,
        default: () => Date.now()
    }
});

module.exports = new mongoose.model('Expense', expenseSchema);