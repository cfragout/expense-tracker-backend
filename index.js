// Use mongo DB queries instead of loading every expense in the DB in memory


const PORT = process.env.PORT || 8000;

require('dotenv').config();
require('./database');
const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const moment = require('moment');
const axios = require('axios');
const fs = require('fs').promises;

const app = express();
app.use(express.json());
app.use(cors());

baseCurrency = 'USD';
currencyShortNames = [];
exchangeRate = {};
mock = true;

const exchangeRateAPI = 'https://api.apilayer.com/exchangerates_data';

const Expense = require('./Expense');
const Category = require('./Category');


app.get('/', (req, res) => {
    res.json(crypto.randomUUID())
})


app.get('/api/expenses/yearly', async (req, res) => {
    // needs validations
    const date = moment(req.query.date);
    const currency = getRequestCurrency(req);
    let expenses = await getAllExpenses();
    if (req.query.include !== undefined) {
        expenses = applyCategoryFilter(expenses, req.query.include, req.query.categories.split(','));
    }

    const expensesInSameYear = expenses.filter(e => moment(e.date).isSame(date, 'year'));
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
app.get('/api/expenses/daily', async (req, res) => {
    // needs validations
    let dateFrom = moment().startOf('month');
    let dateTo = moment().endOf('month');
    const currency = getRequestCurrency(req);

    if (req.query.from && req.query.to) {
        dateFrom = moment(req.query.from).startOf('day');
        dateTo = moment(req.query.to).endOf('day');
    }

    const lastDateIndex = dateTo.diff(dateFrom, 'days') + 1;
    const expenses = await getAllExpenses();

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


app.get('/api/expenses/byCategory/summary', async (req, res) => {
    let expenses = await getAllExpenses();
    const currency = getRequestCurrency(req);

    if (req.query.include !== undefined) {
        expenses = applyCategoryFilter(expenses, req.query.include, req.query.categories.split(','));
    }

    let expensesInRange = [...expenses];
    if (req.query.from && req.query.to) {
        expensesInRange = applyDateRangeFilter(expenses, req.query.from, req.query.to);
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


app.get('/api/expenses/byCategory/weekday', async (req, res) => {
    let expenses = await getAllExpenses();
    const currency = getRequestCurrency(req);

    if (req.query.include !== undefined) {
        expenses = applyCategoryFilter(expenses, req.query.include, req.query.categories.split(','));
    }

    if (req.query.from && req.query.to) {
        expenses = applyDateRangeFilter(expenses, req.query.from, req.query.to);
    }

    const categoriesWeekday = [];
    for (let index = 0; index <= 6; index++) {
        const expensesInDay = expenses.filter(e => +moment(e.date).format('d') === index);
        const expensesByCategory = accumulateExpensesByCategory(listWithPreferredCurrency(currency, expensesInDay));

        categoriesWeekday[index] = expensesByCategory;
    }

    res.json({ response: categoriesWeekday })
})

app.get('/api/expenses/byCategory/yearly', async (req, res) => {
    let expenses = await getAllExpenses();
    const currency = getRequestCurrency(req);

    if (req.query.include !== undefined) {
        expenses = applyCategoryFilter(expenses, req.query.include, req.query.categories.split(','));
    }

    const categoriesYearly = []
    const date = moment(req.query.date);
    for (let index = 0; index < 12; index++) {
        date.set('month', index);

        const expensesInMonth = listWithPreferredCurrency(currency, expenses).filter(e => moment(e.date).isSame(date, 'month'));
        const expensesByCategory = accumulateExpensesByCategory(expensesInMonth);

        categoriesYearly.push(expensesByCategory);
    }

    res.json({ response: categoriesYearly })
})


app.get('/api/expenses/byCategory', async (req, res) => {
    // needs validations
    let expenses = await getAllExpenses();
    const currency = getRequestCurrency(req);

    if (req.query.include !== undefined) {
        expenses = applyCategoryFilter(expenses, req.query.include, req.query.categories.split(','));
    }

    if (req.query.from && req.query.to) {
        expenses = applyDateRangeFilter(expenses, req.query.from, req.query.to);
    }

    expenses = listWithPreferredCurrency(currency, expenses);

    const expensesByCategory = accumulateExpensesByCategory(expensesInRange);

    res.json({ response: expensesByCategory })
})

app.get('/api/expenses/subCategories', async (req, res) => {
    // needs validations
    let expenses = await getAllExpenses();
    const currency = getRequestCurrency(req);

    if (req.query.include !== undefined) {
        expenses = applyCategoryFilter(expenses, req.query.include, req.query.categories.split(','));
    }

    if (req.query.category !== undefined) {
        expenses = expenses.filter(expense => expense.category.name === req.query.category)
    }

    if (req.query.from && req.query.to) {
        expenses = applyDateRangeFilter(expenses, req.query.from, req.query.to)
    }

    expenses = listWithPreferredCurrency(currency, expenses)

    const expensesSubCategories = accumulateExpensesBySubCategory(expenses);

    res.json({ response: expensesSubCategories })
})


app.get('/api/expenses', async (req, res) => {
    let expenses = await getAllExpenses();
    const currency = getRequestCurrency(req);

    if (req.query.include !== undefined) {
        expenses = applyCategoryFilter(expenses, req.query.include, req.query.categories.split(''));
    }

    if (req.query.from && req.query.to) {
        expenses = applyDateRangeFilter(expenses, req.query.from, req.query.to);
    }

    res.json({
        response: listWithPreferredCurrency(currency, expenses)
    })
})


app.get('/api/expenses/:id', async (req, res) => {
    const expense = await findExpenseById(req.params.id);
    const currency = getRequestCurrency(req);

    if (expense) {
        res.json({ resposne: withPreferredCurrency(currency, expense) });
    } else {
        res.status(404).end();
    }
})


app.post('/api/expenses', async (req, res) => {
    const { amount, currency, category } = req.body;

    // simple validations
    if (!amount) {
        res.status(403).send('Amount is required');
        return;
    }

    if (!currency) {
        res.status(403).send('Currency is required');
        return;
    }

    if (!category) {
        res.status(403).send('Category is required');
        return;
    }

    const newExpense = await Expense.create({
        date: moment(req.body.date).set('hours', 12),
        amount: req.body.amount,
        originalAmount: req.body.amount,
        currency,
        originalCurrency: currency,
        category: req.body.category.id,
        subCategories: req.body.subCategories ? req.body.subCategories.map(s => s.id) : [],
        rates: await getCurrencyRates(currency, amount)
    });

    console.log(': Created new expense', newExpense)

    res.json({ response: newExpense });
})


app.delete('/api/expenses/:id', async (req, res) => {
    const id = req.params.id;
    await Expense.deleteOne({ _id: id });
    res.json({ reponse: undefined });
})


app.put('/api/expenses/:id', async (req, res) => {
    const id = req.params.id;
    const updatedExpense = req.body;
    let expense = await Expense.findById(id) //.populate('category');
    if (expense) {
        expense.amount = updatedExpense.amount;
        expense.date = updatedExpense.date;
        expense.description = updatedExpense.description;
        expense.currency = updatedExpense.currency;
        expense.updatedAt = Date.now()
        expense.category = updatedExpense.category;
        expense.subCategories = updatedExpense.subCategories?.length > 0 ? updatedExpense.subCategories.map(s => s.id) : [];
        expense.rates = await getCurrencyRates(updatedExpense.currency, updatedExpense.amount);
        await expense.save();
        res.json({ response: expense });
    } else {
        res.statusCode(404);
    }
})


// Categories
app.get('/api/categories', async (req, res) => {
    res.json({
        response: await Category.find()
    })
})


app.post('/api/categories', async (req, res) => {
    const newCategory = await Category.create({
        ...req.body
    });

    res.json({ response: newCategory })
})


// Currencies
app.get('/api/currencies', async (req, res) => {
    res.json({
        response: currencies
    })
})


app.listen(PORT, async () => {
    currencies = await readJsonFile('./currencies.json');
    currencyShortNames = currencies.map(c => c.shortName);
    console.log(`Listening on port ${PORT}`);
});



function convertToBaseCurrency(originalCurrency, amount) {
    return amount / exchangeRate.rates[originalCurrency];
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
    currencyShortNames.forEach(currency => {
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
            const { data } = await axios(`${exchangeRateAPI}/latest?symbols=${currencyShortNames.join('%2C')}&base=${baseCurrency}`, requestOptions)
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
                USD: 1,
                GBP: 0.897103,
                ARS: 146.9829,
                EUR: 1.019185,
                CHF: 0.98512,
                HRK: 7.673699,
                CZK: 25.055035,
                HUF: 430.694998,
                SEK: 11.080299,
                ISK: 144.010262,
                DKK: 7.578701,
                NOK: 10.85668,
                RON: 5.050102,
                BGN: 1.99559,
                PLN: 4.945399,
                BAM: 1.995338,
                TRY: 18.517197,
                AUD: 1.55498,
                NZD: 1.775285,
                JPY: 144.75899
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

function accumulateExpensesBySubCategory(expenses) {
    const expensesBySubCategory = {};
    expenses.forEach(exp => {
        exp.subCategories.forEach(sub => {
            if (expensesBySubCategory[sub.name]) {
                expensesBySubCategory[sub.name] += exp.amount;
            } else {
                expensesBySubCategory[sub.name] = exp.amount;
            }
        })
    })

    return expensesBySubCategory
}

function applyCategoryFilter(expenses, include, categoryIds) {
    filteredExpenses = expenses.filter(e => {
        if (include === 'true') {
            // only get the expenses from included categories
            return categoryIds.indexOf(e.category._id.toString()) > -1;
        } else {
            // only filter out the expenses from excluded categories
            return categoryIds.indexOf(e.category._id.toString()) === -1;
        }
    });

    return applySubCategoryFilter(filteredExpenses, include, categoryIds) ;
}

function applySubCategoryFilter(expenses, include, subcateryIds) {
    filteredExpenses = expenses.filter(e => {
        if (include === 'true') {
            // only get the expenses from included categories
            return subcateryIds.filter(id => e.subCategories.map(sub => sub._id.toString()).includes(id)).length > 0
        } else {
            // only filter out the expenses from excluded categories
            return subcateryIds.filter(id => e.subCategories.map(sub => sub._id.toString()).includes(id)).length === 0
        }
    });

    return filteredExpenses;
}

function applyDateRangeFilter(expenses, from, to) {
    let expensesInRange = []

    if (from && to) {
        const mfrom = moment(from).startOf('day');
        const mto = moment(to).endOf('day');

        expensesInRange = expenses.filter(e => {
            const expenseDate = moment(e.date);
            return expenseDate.isBetween(mfrom, mto, 'hours');
        });
    }

    return expensesInRange;
}

function round(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
}

async function getAllExpenses() {
    return await Expense.find().populate('category').populate('subCategories').lean();
}

async function findExpenseById(id) {
    return await Expense.findById(id).populate('category').lean();
}

async function readJsonFile(fileName) {
    const data = await fs.readFile(fileName, 'utf8');
    return JSON.parse(data);
}

function getRequestCurrency(request) {
    return request.query.currency === 'null' || !request.query.currency ? baseCurrency : request.query.currency;
}