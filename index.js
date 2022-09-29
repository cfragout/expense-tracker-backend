const PORT = 8000;

const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const moment = require('moment');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

baseCurrency = 'USD';
currencies = [baseCurrency, 'GBP', 'EUR', 'CHF', 'ARS'];
exchangeRate = {};
mock = true;

const exchangeRateAPI = 'https://api.apilayer.com/exchangerates_data';

let expenses = [];

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
    const currency = req.query.currency || baseCurrency;
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
            expenses: monthlyExpenses.length > 0 ? listWithPreferredCurrency(currency, monthlyExpenses).map(e => e.amount).reduce((prev, cur) => prev + cur) : 0
        });
    }

    res.json({ response: yearlyExpenses });
})


// Expenses
app.get('/api/expenses/daily', (req, res) => {
    // needs validations
    let dateFrom = moment().startOf('month');
    let dateTo = moment().endOf('month');
    const currency = req.query.currency || baseCurrency;

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
        const totalExpenses = expensesForToday.length > 0 ? listWithPreferredCurrency(currency, expensesForToday).map(e => e.amount).reduce((prev, current) => prev + current) : 0;

        monthlyExpenses.push(totalExpenses);
    }

    res.json({ response: monthlyExpenses });
})


app.get('/api/expenses/byCategory/summary', (req, res) => {
    let filteredExpenses = [...expenses];
    const currency = req.query.currency || baseCurrency;

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

    // get expenses in preferred currency
    expensesInRange = listWithPreferredCurrency(currency, expensesInRange)

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
    const currency = req.query.currency || baseCurrency;

    if (req.query.include !== undefined) {
        filteredExpenses = applyCategoryFilter(expenses, req.query.include, req.query.categories.split(','));
    }

    const categoriesYearly = []
    const date = moment(req.query.date);
    for (let index = 0; index < 12; index++) {
        date.set('month', index);

        const expensesInMonth = listWithPreferredCurrency(currency, filteredExpenses).filter(e => moment(e.date).isSame(date, 'month'));
        const expensesByCategory = accumulateExpensesByCategory(expensesInMonth);

        categoriesYearly.push(expensesByCategory);
    }

    res.json({ response: categoriesYearly })
})


app.get('/api/expenses/byCategory', (req, res) => {
    // needs validations
    let filteredExpenses = [...expenses];
    const currency = req.query.currency || baseCurrency;

    if (req.query.include !== undefined) {
        filteredExpenses = applyCategoryFilter(expenses, req.query.include, req.query.categories.split(','));
    }

    if (req.query.from && req.query.to) {
        const from = moment(req.query.from).startOf('day');
        const to = moment(req.query.to).endOf('day');

        expensesInRange = listWithPreferredCurrency(currency, filteredExpenses).filter(e => {
            const expenseDate = moment(e.date);
            return expenseDate.isBetween(from, to, 'hours');
        });
    }

    const expensesByCategory = accumulateExpensesByCategory(expensesInRange);

    res.json({ response: expensesByCategory })
})


app.get('/api/expenses', (req, res) => {
    let expensesInRange = [...expenses];
    const currency = req.query.currency || baseCurrency;

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
        response: listWithPreferredCurrency(currency, expensesInRange)
    })
})


app.get('/api/expenses/:id', (req, res) => {
    const expense = expenses.find(e => e.id === req.params.id);
    const currency = req.query.currency || baseCurrency;

    if (expense) {
        res.json({ resposne: withPreferredCurrency(currency, expense) });
    } else {
        res.status(404).end();
    }
})


app.post('/api/expenses', async (req, res) => {
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
        originalAmount: +req.body.amount,
        currency,
        originalCurrency: currency,
        category: categories.find(c => c.id === req.body.category) || { name: 'Sin categoria', id: '-1' }
    }
    newExpense.rates = await getCurrencyRates(currency, amount);

    expenses.push(newExpense);
    res.json(newExpense);
})


app.delete('/api/expenses/:id', (req, res) => {
    const id = req.params.id;
    const expense = expenses.find(e => e.id === id);
    if (expense) {
        expenses = expenses.filter(e => e.id !== id);
        res.json({ response: expense });
    } else {
        res.json({ reponse: undefined });
    }
})


app.put('/api/expenses/:id', async (req, res) => {
    const id = req.params.id;
    const updatedExpense = req.body;
    updatedExpense.category = categories.find(c => c.id === (updatedExpense.category.id || updatedExpense.category));
    updatedExpense.amount = +updatedExpense.amount;
    updatedExpense.rates = await getCurrencyRates(updatedExpense.currency, updatedExpense.amount);

    const oldExpense = expenses.find(e => e.id === id);
    if (oldExpense) {
        expenses = expenses.filter(e => e.id !== id);
        expenses.push(updatedExpense)
        res.json({ response: updatedExpense });
    } else {
        res.statusCode(404);
    }
})


// Categories
app.get('/api/categories', (req, res) => {
    res.json({
        response: categories
    })
})


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



function convertToBaseCurrency(originalCurrency, amount) {
    return amount / exchangeRate.rates[originalCurrency];
}

function converToCurrency(from, to, amount) {
    const amountInBaseCurrency = this.convertToBaseCurrency(from, amount);

}

// given a list of expenses, modify each one to contain the amount in the preferred currency
function listWithPreferredCurrency(expectedCurrency, expenses) {
    return expenses.map(expense => withPreferredCurrency(expectedCurrency, expense));
}

function withPreferredCurrency(expectedCurrency, expense) {
    return {
        ...expense,
        amount: round(expense.rates[expectedCurrency]),
        currency: expectedCurrency
    }
}

async function getCurrencyRates(amountCurrency, amount) {
    if (!isRateUpToDate()) {
        await refreshExchangeRates(mock);
    }

    const currencyRates = {};
    const amountInBaseCurrency = convertToBaseCurrency(amountCurrency, amount);
    currencies.forEach(currency => {
        currencyRates[currency] = currency === amountCurrency ? +amount : amountInBaseCurrency * exchangeRate.rates[currency];
    })

    return currencyRates;
}

// returns true if exchange rate is more than 5 hours old
// returns false if exchange rate has no date or it is more than 5 hours old
function isRateUpToDate() {
    return exchangeRate.date && !exchangeRate.date.isBefore(moment().subtract(5, 'hour'))
}

async function refreshExchangeRates(mock) {
    const requestOptions = {
        method: 'GET',
        redirect: 'follow',
        headers: { 'apikey': 'O0SCPGfQjbvXsPll2GCoGq31NmoaL3Kh' }
    };

    if (!mock) {
        try {
            const { data } = await axios(`${exchangeRateAPI}/latest?symbols=${currencies.join('%2C')}&base=${baseCurrency}`, requestOptions)
            exchangeRate = {
                base: baseCurrency,
                rates: data.rates,
                date: moment.unix(data.timestamp)
            }
            console.log('Currency rates updated: ', exchangeRate)
        } catch (error) {
            console.error(error);
        }
    } else {
        console.log('Exchange rates mocked...')
        exchangeRate = {
            base: baseCurrency,
            rates: {
                "ARS": 146.851079,
                "CHF": 0.98147,
                "EUR": 1.03843,
                "GBP": 0.930403,
                "USD": 1
            },
            date: moment()
        }
    }
}

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

function round(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
}