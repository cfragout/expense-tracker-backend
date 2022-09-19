const PORT = 8000;

const express = require('express');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const expenses = [
    {
        id: '0',
        amount: 3215,
        user: 'testy',
        currency: '2',
        description: 'Papas fritas turbias',
        category: '1',
        date: 'Mon Sep 19 2022 11:30:49 GMT-0300 (hora estándar de Argentina)'
    }
]

app.get('/', (req, res) => {
    res.json(crypto.randomUUID())
})

app.get('/api/expenses', (req, res) => {
    res.json({
        response: expenses
    })
})

app.get('/api/expenses/:id', (req, res) => {
    const expense = expenses.find(e => e.id === req.params.id);

    if (expense) {
        res.json(expense);
    } else {
        res.status(404).end();
    }
})

app.post('/api/expenses', (req, res) => {
    const { amount, currency } = req.body;

    // simple validations
    if (!amount) {
        res.status(403);
        res.send('Amount is required')
    }

    if (!currency) {
        res.status(403);
        res.send('Currency is required')
    }

    const newExpense = {
        id: crypto.randomUUID(),
        amount,
        currency,
        ...req.body
    }

    
    expenses.push(newExpense);
    res.json(newExpense);
})


app.listen(PORT, () => console.log(`Listening on port ${PORT}`))