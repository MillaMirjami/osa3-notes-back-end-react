require('dotenv').config()
const express = require('express')
const app = express()
const Note = require('./Models/note')

app.use(express.json())
app.use(express.static('dist'))
// Otetaan käyttöön json expressille, jotta voidaan muuttaa json-merkkijono js-olioksi ja toisinpäin.
// Tämä middleware muuttaa json-muotoisen merkkijonon js-olioksi ennen post-tapahtumakäsittelijää.

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path', request.path)
    console.log('Body', request.body)
    console.log('---')
    next()
}
app.use(requestLogger)


app.get('/api/notes', (request, response, next) => {
    Note.find({})
    .then(notes => response.json(notes))
    .catch(error => next(error))
})

app.get('/api/notes/:id', (request, response, next) => {
    Note.findById(request.params.id)
    .then(note => {
        if(note) {
            response.json(note)
        } else {
            response.status(404).end()
        }
    })
    .catch(error => next(error))
})

app.delete('/api/notes/:id', (request, response, next) => {
    Note.findByIdAndDelete(request.params.id)
    .then(result => response.status(204).end())
    .catch(error => next(error))
})

app.put('/api/notes/:id', (request, response, next) => {
    const {content, important} = request.body
    
    Note.findByIdAndUpdate(request.params.id)
    .then(updatedNote => {
        if(!updatedNote) {
            return response.status(404).end()
        }
        updatedNote.content = content
        updatedNote.important = important
        return updatedNote.save().then(updatedNote => response.json(updatedNote))
    })
    .catch(error => next(error))
})

app.post('/api/notes', (request, response, next) => {
    const body = request.body // middleware on jo muuttanut tässä json-merkkijonon js-olioksi eli note on js-olio.
    
    if(!body.content) {
        return response.status(400).json({error: "content missing"})
    }
    
    const note = new Note({
        content: body.content,
        important: body.important || false
    }) 
    
    note.save()
    .then(savedNote => response.json(savedNote))
    .catch(error => next(error))
    // .json muuttaa js-olion takaisin json-merkkijonoksi ja lähettää sen näin takaisin asiakkaalle.
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unkown endpoint'})
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    
    if(error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id'})
    }
    
    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})


// const http = require('http')
// const app = http.createServer((request, response) => {
//   response.writeHead(200, { 'Content-Type': 'application/json' })
//   response.end(JSON.stringify(notes))
// }) // This would be without express