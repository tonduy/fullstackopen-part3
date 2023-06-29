const express = require('express')
const app = express()
const morgan = require('morgan');
app.use(express.json())

morgan.token("postData", req => {
    return req.method === "POST" ? JSON.stringify(req.body) : '';
});

app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms :postData')
);

const cors = require('cors')

app.use(cors())
app.use(express.static('build'))

let phonebook = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

app.get('/info', (request, response) => {
    response.send('Phonebook has info for ' + phonebook.length + ' people ' +
        '<p>' + new Date() + '</p>'
    )
})

app.get('/api/persons', (request, response) => {
    response.json(phonebook)
})

app.get("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id)
    let person = phonebook.find(p => p.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    phonebook = phonebook.filter(p => p.id !== id)

    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name) {
        return response.status(400).json({
            error: 'name is missing'
        })
    } else if (!body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    } else if (phonebook.filter(p => p.name === body.name).length > 0) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    }

    phonebook = phonebook.concat(person)
    response.json(person)
})

const generateId = () => {
    const idLength = 4;
    let id = '';

    for (let i = 0; i < idLength; i++) {
        const randomIndex = Math.floor(Math.random() * idLength);
        id += randomIndex;
    }

    return Number(id);
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})