const PORT = 8000;

const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const moment = require('moment');

const app = express();
app.use(express.json());
app.use(cors());

let expenses = [
    {
        id: '0',
        amount: 32.15,
        user: 'juan',
        currency: '2',
        description: '',
        category: {
            name: 'Supermercado',
            color: '',
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
            color: '',
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
            color: '',
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
            color: '',
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
            color: '',
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
            color: '',
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
            color: ''
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
            color: '',
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
            color: '',
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
            color: '',
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
            color: '',
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
            color: '2',
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
            color: ''
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
            color: ''
        },
        date: '2022-07-26T20:34:39.163Z'
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
            color: ''
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
            color: ''
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
            color: ''
        },
        date: '2022-07-17T20:34:39.163Z'
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
            color: ''
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
            color: ''
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
            color: ''
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
            color: '',
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
            color: '',
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
            color: '',
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
            color: '',
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
            color: '',
            id: '645-321-123'
        },
        date: '2020-05-03T20:34:39.163Z'
    },
]

const categories = [
    {
        id: '0',
        name: 'Viajes',
        color: 'USD'
    },
    {
        id: '2',
        name: 'Supermercado',
        color: 'GBP'
    },
    {
        id: '8',
        name: 'Alquiler',
        color: 'ARS'
    },
    {
        id: '645-321-123',
        name: 'Internet',
        color: 'ARS'
    },
    {
        id: '9',
        name: 'Transporte',
        color: 'ARS'
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
app.get('/api/expenses/daily', (req, res) => {
    // needs validations
    let dateFrom = moment().startOf('month');
    let dateTo = moment().endOf('month');

    if (req.query.from && req.query.to) {
        dateFrom = moment(req.query.from).startOf('day');
        dateTo = moment(req.query.to).endOf('day');
    }

    const lastDateIndex = dateTo.diff(dateFrom, 'days') + 1;

    expensesInRange = expenses.filter(e => {
        const expenseDate = moment(e.date);
        return expenseDate.isBetween(dateFrom, dateTo, 'hours');
    });

    let filteredExpenses = [...expensesInRange];
    if (req.query.include !== undefined) {
        filteredExpenses = applyCategoryFilter(expenses, req.query.include, req.query.categories.split(','));
    }

    // may be able to do this better once mongodb is in place
    const monthlyExpenses = [];
    for (let index = 0; index < lastDateIndex; index++) {
        const date = moment(dateFrom).add(index, 'days');

        const expensesForToday = filteredExpenses.filter(e => {
            let expenseDate = moment(e.date);
            return expenseDate.isSame(date, 'days');
        });

        // need to check currency here
        const totalExpenses = expensesForToday.length > 0 ? expensesForToday.map(e => e.amount).reduce((prev, current) => prev + current) : 0;

        monthlyExpenses.push(totalExpenses);
    }

    res.json({ response: monthlyExpenses });
})


app.get('/api/expenses/byCategory/summary', (req, res) => {
    let filteredExpenses = [...expenses];
    if (req.query.include !== undefined) {
        filteredExpenses = applyCategoryFilter(expenses, req.query.include, req.query.categories.split(','));
    }

    let expensesInRange = [...filteredExpenses];
    if (req.query.from && req.query.to) {
        const from = moment(req.query.from).startOf('day');
        const to = moment(req.query.to).endOf('day');

        expensesInRange = expensesInRange.filter(e => {
            const expenseDate = moment(e.date);
            return expenseDate.isBetween(from, to, 'hours');
        });
    }

    // sort expenses by ammount
    expensesInRange.sort((a, b) => (a.amount > b.amount) ? -1 : ((b.amount > a.amount) ? 1 : 0));

    // accumulate totals by category
    const expensesSummary = accumulateExpensesByCategory(expensesInRange);

    const expensesByCategory = {};
    expensesInRange.forEach(e => {
        if (expensesByCategory[e.category.name]) {
            expensesByCategory[e.category.name].push(e);
        } else {
            expensesByCategory[e.category.name] = [e];
        }
    });

    // sort by date
    const sortedExpensesByCategory = {};
    Object.keys(expensesByCategory).forEach(key => {
        sortedExpensesByCategory[key] = expensesByCategory[key]
            .sort((a, b) => (moment(a.date).isBefore(moment(b.date))) ? -1 : ((moment(b.date).isBefore(a.date)) ? 1 : 0));
    })

    // accumulate multiple expenses from the same day and format date
    const accumulatedSortedExpensesByCategory = {};
    Object.keys(sortedExpensesByCategory).forEach(key => {
        const categoryExpenses = sortedExpensesByCategory[key];
        const accumulated = {};
        categoryExpenses.forEach(expense => {
            const date = moment(expense.date).format('DD-MM-yyyy');
            if (accumulated[date]) {
                accumulated[date].amount += expense.amount;
            } else {
                accumulated[date] = { ...expense, date };
            }
        });

        accumulatedSortedExpensesByCategory[key] = Object.values(accumulated);
    })

    res.json({ response: { summary: expensesSummary, byCategory: accumulatedSortedExpensesByCategory } })
})


app.get('/api/expenses/byCategory/yearly', (req, res) => {
    let filteredExpenses = [...expenses];
    if (req.query.include !== undefined) {
        filteredExpenses = applyCategoryFilter(expenses, req.query.include, req.query.categories.split(','));
    }

    const categoriesYearly = []
    const date = moment(req.query.date);
    for (let index = 0; index < 12; index++) {
        date.set('month', index);

        const expensesInMonth = filteredExpenses.filter(e => moment(e.date).isSame(date, 'month'));
        const expensesByCategory = accumulateExpensesByCategory(expensesInMonth);

        categoriesYearly.push(expensesByCategory);
    }

    res.json({ response: categoriesYearly })
})


app.get('/api/expenses/byCategory', (req, res) => {
    // needs validations
    let filteredExpenses = [...expenses];
    if (req.query.include !== undefined) {
        filteredExpenses = applyCategoryFilter(expenses, req.query.include, req.query.categories.split(','));
    }

    if (req.query.from && req.query.to) {
        const from = moment(req.query.from).startOf('day');
        const to = moment(req.query.to).endOf('day');

        expensesInRange = filteredExpenses.filter(e => {
            const expenseDate = moment(e.date);
            return expenseDate.isBetween(from, to, 'hours');
        });
    }

    const expensesByCategory = accumulateExpensesByCategory(expensesInRange);

    res.json({ response: expensesByCategory })
})


app.get('/api/expenses', (req, res) => {
    let expensesInRange = [...expenses];
    if (req.query.include !== undefined) {
        expensesInRange = applyCategoryFilter(expenses, req.query.include, req.query.categories.split(''));
    }

    if (req.query.from && req.query.to) {
        const from = moment(req.query.from).startOf('day');
        const to = moment(req.query.to).endOf('day');

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
        date: moment(req.body.date).set('hours', 12),
        id: crypto.randomUUID(),
        amount: +req.body.amount,
        currency,
        category: categories.find(c => c.id === req.body.category) || { name: 'Sin categoria', id: '-1' }
    }

    expenses.push(newExpense);
    res.json(newExpense);
})


app.delete('/api/expenses/:id', (req, res) => {
    const id = req.params.id;
    const expense = expenses.find(e => e.id === id);
    if (expense) {
        expenses = expenses.filter(e => e.id !== id)
        res.json({ response: expense })
    } else {
        res.json({ reponse: undefined })
    }
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


function accumulateExpensesByCategory(expenses) {
    const expensesByCategory = {};
    expenses.forEach(exp => {
        if (expensesByCategory[exp.category.name]) {
            expensesByCategory[exp.category.name] += exp.amount;
        } else {
            expensesByCategory[exp.category.name] = exp.amount;
        }
    });

    return expensesByCategory;
}

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