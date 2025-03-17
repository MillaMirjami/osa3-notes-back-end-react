const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://fullstack:${password}@cluster0.5i94f.mongodb.net/NoteApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
})

const Note = mongoose.model('Note', noteSchema)

Note.find({important: false}).then(result => {
  result.forEach(note => console.log(note))
  mongoose.connection.close()
})

// const note = new Note({
//   content: 'You need to know everything about Programming',
//   important: false,
// })

// note.save().then(result => {
//   console.log('note saved!', result)
//   mongoose.connection.close()
// })