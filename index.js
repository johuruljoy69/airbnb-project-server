const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const port = process.env.PORT || 5000

// middleware
const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xmzpktv.mongodb.net/?retryWrites=true&w=majority`


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        const usersCollection = client.db('airbnbDB').collection('users')
        const roomsCollection = client.db('airbnbDB').collection('rooms')
        const bookingsCollection = client.db('airbnbDB').collection('bookings')

        // Save user email and role in DB
        app.put('/users/:email', async (req, res) => {
            const email = req.params.email
            const user = req.body
            const query = { email: email }
            const options = { upsert: true }
            const updateDoc = {
                $set: user,
            }
            const result = await usersCollection.updateOne(query, updateDoc, options)
            console.log(result)
            res.send(result)
        });

        // Get user
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const result = await usersCollection.findOne(query)
            res.send(result)
        });

        // Get all rooms
        app.get('/rooms', async (req, res) => {
            const result = await roomsCollection.find().toArray()
            res.send(result)
        });

        // delete room
        app.delete('/rooms/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await roomsCollection.deleteOne(query)
            res.send(result)
        })
        // Get a single room
        app.get('/rooms/:email', verifyJWT, async (req, res) => {
            const email = req.params.email
            const query = { 'host.email': email }
            const result = await roomsCollection.find(query).toArray()
            res.send(result)
        })

        // Get a single room
        app.get('/room/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await roomsCollection.findOne(query)
            res.send(result)
        });

        // Save a room in database
        app.post('/rooms', verifyJWT, async (req, res) => {
            console.log(req.decoded)
            const room = req.body
            const result = await roomsCollection.insertOne(room)
            res.send(result)
        });

        // update room booking status
        app.patch('/rooms/status/:id', async (req, res) => {
            const id = req.params.id
            const status = req.body.status
            const query = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    booked: status,
                },
            }
            const update = await roomsCollection.updateOne(query, updateDoc)
            res.send(update)
        });

        // Update A room
        app.put('/rooms/:id', verifyJWT, async (req, res) => {
            const room = req.body
            console.log(room)

            const filter = { _id: new ObjectId(req.params.id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: room,
            }
            const result = await roomsCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })

        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Airbnb Server is running..')
})

app.listen(port, () => {
    console.log(`Airbnb is running on port ${port}`)
})