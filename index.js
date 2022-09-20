const PORT = 8000;

const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const moment = require('moment');

const app = express();
app.use(express.json());
app.use(cors());

const expenses = [
    {
        id: '0',
        amount: 32.15,
        user: 'juan',
        currency: '2',
        description: '',
        category: '1',
        date: '2022-09-19T20:34:39.163Z'
    },
    {
        id: '1',
        amount: 17.50,
        user: 'testy',
        currency: '2',
        description: 'Gaseosa',
        category: '1',
        date: '2021-09-12T20:34:39.163Z'
    },
    {
        id: '2',
        amount: 25,
        user: 'testy',
        currency: '2',
        description: 'Auto mac',
        category: '1',
        date: '2022-09-18T20:34:39.163Z'
    },
    {
        id: '3',
        amount: 14,
        user: 'testy',
        currency: '2',
        description: '',
        category: '1',
        date: '2022-09-15T20:34:39.163Z'
    },
    {
        id: '4',
        amount: 2,
        user: 'testy',
        currency: '2',
        description: '',
        category: '1',
        date: '2022-09-13T20:34:39.163Z'
    },
    {
        id: '5',
        amount: 1.99,
        user: 'testy',
        currency: '2',
        description: '',
        category: '1',
        date: '2022-09-11T20:34:39.163Z'
    },
    {
        id: '6',
        amount: 7.50,
        user: 'testy',
        currency: '2',
        description: '',
        category: '3',
        date: '2022-09-19T21:34:39.163Z'
    },
    {
        id: '7',
        amount: 1.01,
        user: 'testy',
        currency: '2',
        description: '',
        category: '1',
        date: '2021-05-19T20:34:39.163Z'
    },
    {
        id: '8',
        amount: 9.99,
        user: 'testy',
        currency: '1',
        description: '',
        category: '1',
        date: '2022-09-10T20:34:39.163Z'
    },
    {
        id: '9',
        amount: 77.50,
        user: 'juan',
        currency: '2',
        description: '',
        category: '1',
        date: '2022-09-02T20:34:39.163Z'
    },
    {
        id: '10',
        amount: 10,
        user: 'juan',
        currency: '2',
        description: '',
        category: '1',
        date: '2022-09-02T20:34:39.163Z'
    },
    {
        id: '11',
        amount: 100,
        user: 'juan',
        currency: '2',
        description: '',
        category: '1',
        date: '2022-09-02T20:34:39.163Z'
    },
    {
        id: '12',
        amount: 30,
        user: 'testy',
        currency: '2',
        description: '',
        category: '3',
        date: '2022-09-02T20:34:39.163Z'
    },
    {
        id: '13',
        amount: 12,
        user: 'juan',
        currency: '2',
        description: '',
        category: '4',
        date: '2022-09-02T20:34:39.163Z'
    },
    {
        id: '14',
        amount: 12,
        user: 'juan',
        currency: '2',
        description: '',
        category: 'prueba',
        date: '2022-09-02T20:34:39.163Z'
    },
]

app.get('/', (req, res) => {
    res.json(crypto.randomUUID())
})

app.get('/api/expenses/byCategory', (req, res) => {
    // needs validations
    const date = moment(req.query.date);
    const limit = req.query.limit || 5;

    const expensesInMonth = expenses.filter(e => {
        const expenseDate = moment(e.date);
        return expenseDate.isSame(date, 'month');
    });

    const expensesByCategory = {};
    expensesInMonth.forEach(exp => {
        if (expensesByCategory[exp.category]) {
            expensesByCategory[exp.category] += exp.amount;
        } else {
            expensesByCategory[exp.category] = exp.amount;
        }
    })

    res.json({ response: expensesByCategory })
})

app.get('/api/expenses', (req, res) => {
    const from = moment(req.query.from);
    const to = moment(req.query.to);

    const expensesInRange = expenses.filter(e => {
        const expenseDate = moment(e.date);
        return expenseDate.isBetween(from, to, 'hour');
    });


    res.json({
        response: expensesInRange
    })
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


app.get('/api/expenses/monthly/:date', (req, res) => {

    // needs validations
    const date = moment(req.params.date);
    const lastDate = date.daysInMonth();
    const monthlyExpenses = [];

    // may be able to do this better once mongodb is in place
    for (let index = 1; index <= lastDate; index++) {

        // all the expenses made in the date === index
        const expensesForToday = expenses.filter(e => {
            const expenseDate = moment(e.date);
            return expenseDate.isSame(date, 'month') && expenseDate.date() === index;
        });

        // need to check currency here
        const totalExpenses = expensesForToday.length > 0 ? expensesForToday.map(e => e.amount, 10).reduce((prev, current) => prev + current) : 0;


        monthlyExpenses.push(totalExpenses);
    }

    res.json({ response: monthlyExpenses });
})


// :date should be query string
app.get('/api/expenses/monthly/:date', (req, res) => {

    // needs validations
    const date = moment(req.params.date);
    const lastDate = date.daysInMonth();
    const monthlyExpenses = [];

    // may be able to do this better once mongodb is in place
    for (let index = 1; index <= lastDate; index++) {

        // all the expenses made in the date === index
        const expensesForToday = expenses.filter(e => {
            const expenseDate = moment(e.date);
            return expenseDate.isSame(date, 'month') && expenseDate.date() === index;
        });

        // need to check currency here
        const totalExpenses = expensesForToday.length > 0 ? expensesForToday.map(e => e.amount).reduce((prev, current) => prev + current) : 0;


        monthlyExpenses.push(totalExpenses);
    }

    res.json({ response: monthlyExpenses });
})


app.post('/api/expenses', (req, res) => {
    const { amount, currency } = req.body;

    // simple validations
    if (!amount) {
        res.status(403);
        res.send('Amount is required');
    }

    if (!currency) {
        res.status(403);
        res.send('Currency is required');
    }

    const newExpense = {
        ...req.body,
        id: crypto.randomUUID(),
        amount: parseInt(req.body.amount, 10),
        currency,
    }

    expenses.push(newExpense);
    res.json(newExpense);
})


app.listen(PORT, () => console.log(`Listening on port ${PORT}`))