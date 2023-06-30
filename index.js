const express = require('express')
const app = express()
const morgan = require('morgan');
const Person = require('./models/person')
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


app.get('/info', (request, response, next) => {

    Person.countDocuments({}).then(result => {
        response.send('Phonebook has info for ' + result + ' people ' +
            '<p>' + new Date() + '</p>'
        )
    }).catch(error => next(error))

})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(result => {
        response.json(result)
    })
})

app.get("/api/persons/:id", (request, response, next) => {
    Person.findById(request.params.id).then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    }).catch(error => next(error))

})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id).then(() => {
        response.status(204).end()
    }).catch(error => next(error))

})

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    if (!body.name) {
        return response.status(400).json({
            error: 'name is missing'
        })
    } else if (!body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(result => {
        response.json(result)
    }).catch(error => next(error))

})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    if (!body.name) {
        return response.status(400).json({
            error: 'name is missing'
        })
    } else if (!body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    }

    const name = body.name
    const number = body.number

    Person.findByIdAndUpdate(request.params.id, {name, number}, {new: true}).then((p) => {
        response.json(p)
    }).catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})