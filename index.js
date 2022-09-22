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
        category: {
            name: 'Supermercado',
            icon: '',
            id: '2'
        },
        date: '2022-09-19T20:34:39.163Z'
    },
    {
        id: '1',
        amount: 17.50,
        user: 'testy',
        currency: '2',
        description: 'Gaseosa',
        category: {
            name: 'Supermercado',
            icon: '',
            id: '2'
        },
        date: '2021-09-12T20:34:39.163Z'
    },
    {
        id: '2',
        amount: 25,
        user: 'testy',
        currency: '2',
        description: 'Auto mac',
        category: {
            name: 'Supermercado',
            icon: '',
            id: '2'
        },
        date: '2022-09-18T20:34:39.163Z'
    },
    {
        id: '3',
        amount: 14,
        user: 'testy',
        currency: '2',
        description: '',
        category: {
            name: 'Supermercado',
            icon: '',
            id: '2'
        },
        date: '2022-09-15T20:34:39.163Z'
    },
    {
        id: '4',
        amount: 2,
        user: 'testy',
        currency: '2',
        description: '',
        category: {
            name: 'Supermercado',
            icon: '',
            id: '2'
        },
        date: '2022-09-13T20:34:39.163Z'
    },
    {
        id: '5',
        amount: 1.99,
        user: 'testy',
        currency: '2',
        description: '',
        category: {
            name: 'Supermercado',
            icon: '',
            id: '2'
        },
        date: '2022-09-11T20:34:39.163Z'
    },
    {
        id: '6',
        amount: 7.50,
        user: 'testy',
        currency: '2',
        description: '',
        category: {
            name: 'Transporte',
            id: '9',
            icon: ''
        },
        date: '2022-09-19T21:34:39.163Z'
    },
    {
        id: '7',
        amount: 1.01,
        user: 'testy',
        currency: '2',
        description: '',
        category: {
            name: 'Supermercado',
            icon: '',
            id: '2'
        },
        date: '2021-05-19T20:34:39.163Z'
    },
    {
        id: '8',
        amount: 9.99,
        user: 'testy',
        currency: '1',
        description: '',
        category: {
            name: 'Supermercado',
            icon: '',
            id: '2'
        },
        date: '2022-09-10T20:34:39.163Z'
    },
    {
        id: '9',
        amount: 77.50,
        user: 'juan',
        currency: '2',
        description: '',
        category: {
            name: 'Supermercado',
            icon: '',
            id: '2'
        },
        date: '2022-09-02T20:34:39.163Z'
    },
    {
        id: '10',
        amount: 10,
        user: 'juan',
        currency: '2',
        description: '',
        category: {
            name: 'Supermercado',
            icon: '',
            id: '2'
        },
        date: '2022-09-02T20:34:39.163Z'
    },
    {
        id: '11',
        amount: 100,
        user: 'juan',
        currency: '2',
        description: '',
        category: {
            name: 'Supermercado',
            icon: '2',
            id: '2'
        },
        date: '2022-09-02T20:34:39.163Z'
    },
    {
        id: '12',
        amount: 30,
        user: 'testy',
        currency: '2',
        description: '',
        category: {
            name: 'Transporte',
            id: '9',
            icon: ''
        },
        date: '2022-09-02T20:34:39.163Z'
    },
    {
        id: '13',
        amount: 27.76,
        user: 'juan',
        currency: '2',
        description: '',
        category: {
            name: 'Supermercado',
            id: '2',
            icon: ''
        },
        date: '2022-07-026T20:34:39.163Z'
    },
    {
        id: '55',
        amount: 12,
        user: 'juan',
        currency: '2',
        description: '',
        category: {
            name: 'Internet',
            id: '645-321-123',
            icon: ''
        },
        date: '2022-07-05T20:34:39.163Z'
    },
    {
        id: '55',
        amount: 245,
        user: 'juan',
        currency: '2',
        description: '',
        category: {
            name: 'Supermercado',
            id: '2',
            icon: ''
        },
        date: '2022-07-05T20:34:39.163Z'
    },
    {
        id: '66',
        amount: 101.23,
        user: 'juan',
        currency: '2',
        description: '',
        category: {
            name: 'Supermercado',
            id: '2',
            icon: ''
        },
        date: '2022-07-017T20:34:39.163Z'
    },
    {
        id: '77',
        amount: 3000,
        user: 'juan',
        currency: '2',
        description: '',
        category: {
            name: 'Alquiler',
            id: '8',
            icon: ''
        },
        date: '2022-07-01T20:34:39.163Z'
    },
    {
        id: '88',
        amount: 3000,
        user: 'juan',
        currency: '2',
        description: '',
        category: {
            name: 'Alquiler',
            id: '8',
            icon: ''
        },
        date: '2022-08-01T20:34:39.163Z'
    },
    {
        id: '99',
        amount: 3000,
        user: 'juan',
        currency: '2',
        description: '',
        category: {
            name: 'Alquiler',
            id: '8',
            icon: ''
        },
        date: '2022-09-01T20:34:39.163Z'
    },
    {
        id: '14',
        amount: 12,
        user: 'juan',
        currency: '2',
        description: '',
        category: {
            name: 'Internet',
            icon: '',
            id: '645-321-123'
        },
        date: '2022-09-02T20:34:39.163Z'
    },
    {
        id: '15',
        amount: 22.12,
        user: 'juan',
        currency: '2',
        description: '',
        category: {
            name: 'Supermercado',
            icon: '',
            id: '2'
        },
        date: '2022-09-22T20:34:39.163Z'
    },
    {
        id: '16',
        amount: 69.05,
        user: 'juan',
        currency: '2',
        description: '',
        category: {
            name: 'Supermercado',
            icon: '',
            id: '2'
        },
        date: '2022-09-29T20:34:39.163Z'
    },
    {
        id: '17',
        amount: 71.03,
        user: 'juan',
        currency: '2',
        description: '',
        category: {
            name: 'Supermercado',
            icon: '',
            id: '2'
        },
        date: '2020-05-20T20:34:39.163Z'
    },
    {
        id: '18',
        amount: 30,
        user: 'juan',
        currency: '2',
        description: '',
        category: {
            name: 'Internet',
            icon: '',
            id: '645-321-123'
        },
        date: '2020-05-03T20:34:39.163Z'
    },
]

const categories = [
    {
        id: '0',
        name: 'Viajes',
        icon: 'USD'
    },
    {
        id: '2',
        name: 'Supermercado',
        icon: 'GBP'
    },
    {
        id: '8',
        name: 'Alquiler',
        icon: 'ARS'
    },
    {
        id: '645-321-123',
        name: 'Internet',
        icon: 'ARS'
    },
    {
        id: '9',
        name: 'Transporte',
        icon: 'ARS'
    },
]

app.get('/', (req, res) => {
    res.json(crypto.randomUUID())
})


app.get('/api/expenses/yearly', (req, res) => {
    // needs validations
    const date = moment(req.query.date);
    let filteredExpenses = [...expenses];
    if (req.query.include !== undefined) {
        filteredExpenses = applyCategoryFilter(expenses, req.query.include, req.query.categories.split(','));
    }

    const expensesInSameYear = filteredExpenses.filter(e => moment(e.date).isSame(date, 'year'));
    const yearlyExpenses = [];

    for (let index = 0; index < 12; index++) {
        const currentMonth = moment(date).set('month', index);
        const monthlyExpenses = expensesInSameYear.filter(e => moment(e.date).isSame(currentMonth, 'month'));

        yearlyExpenses.push({
            name: moment().set('month', index).format('MMMM'),
            monthIndex: index,
            expenses: monthlyExpenses.length > 0 ? monthlyExpenses.map(e => e.amount).reduce((prev, cur) => prev + cur) : 0
        });
    }

    res.json({ response: yearlyExpenses });
})


// Expenses
app.get('/api/expenses/monthly', (req, res) => {
    // needs validations
    const date = moment(req.query.date);
    const lastDate = date.daysInMonth();
    const monthlyExpenses = [];
    let filteredExpenses = [...expenses];
    if (req.query.include !== undefined) {
        filteredExpenses = applyCategoryFilter(expenses, req.query.include, req.query.categories.split(','));
    }

    // may be able to do this better once mongodb is in place
    for (let index = 1; index <= lastDate; index++) {

        // all the expenses made in the date === index
        const expensesForToday = filteredExpenses.filter(e => {
            let expenseDate = moment(e.date);
            return expenseDate.isSame(date, 'month') && expenseDate.date() === index;
        });

        // need to check currency here
        const totalExpenses = expensesForToday.length > 0 ? expensesForToday.map(e => e.amount).reduce((prev, current) => prev + current) : 0;

        monthlyExpenses.push(totalExpenses);
    }

    res.json({ response: monthlyExpenses });
})


app.get('/api/expenses/byCategory', (req, res) => {
    // needs validations
    const date = moment(req.query.date);

    let filteredExpenses = [...expenses];
    if (req.query.include !== undefined) {
        filteredExpenses = applyCategoryFilter(expenses, req.query.include, req.query.categories.split(','));
    }

    const expensesInMonth = filteredExpenses.filter(e => {
        const expenseDate = moment(e.date);
        return expenseDate.isSame(date, 'month');
    });

    const expensesByCategory = {};
    expensesInMonth.forEach(exp => {
        if (expensesByCategory[exp.category.name]) {
            expensesByCategory[exp.category.name] += exp.amount;
        } else {
            expensesByCategory[exp.category.name] = exp.amount;
        }
    })

    res.json({ response: expensesByCategory })
})


app.get('/api/expenses', (req, res) => {
    let expensesInRange = [...expenses];
    if (req.query.include !== undefined) {
        expensesInRange = applyCategoryFilter(expenses, req.query.include, req.query.categories.split(''));
    }

    if (req.query.from && req.query.to) {
        const from = moment(req.query.from).set('hours', 00).set('minutes', 00);
        const to = moment(req.query.to).set('hours', 23).set('minutes', 59);

        expensesInRange = expensesInRange.filter(e => {
            const expenseDate = moment(e.date);
            return expenseDate.isBetween(from, to, 'hours');
        });
    }

    res.json({
        response: expensesInRange
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
        res.send('Amount is required');
    }

    if (!currency) {
        res.status(403);
        res.send('Currency is required');
    }

    const newExpense = {
        ...req.body,
        id: crypto.randomUUID(),
        amount: +req.body.amount,
        currency,
        category: categories.find(c => c.id === req.body.category) || { name: 'Sin categoria', id: '-1' }
    }

    expenses.push(newExpense);
    res.json(newExpense);
})

// Categories
app.get('/api/categories', (req, res) => {
    res.json({
        response: categories
    })
})


app.post('/api/categories', (req, res) => {
    const newCategory = {
        ...req.body,
        id: crypto.randomUUID()
    }

    categories.push(newCategory);
    res.json(newCategory)
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`))


function applyCategoryFilter(expenses, include, categoryIds) {
    let filteredExpenses = [...expenses];
    filteredExpenses = expenses.filter(e => {
        if (include === 'true') {
            // only get the expenses from included categories
            return categoryIds.indexOf(e.category.id) > -1;
        } else {
            // only filter out the expenses from excluded categories
            return categoryIds.indexOf(e.category.id) === -1;
        }
    });

    return filteredExpenses;
}