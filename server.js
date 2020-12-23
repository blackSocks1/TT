const mongoose = require('mongoose');
const _ = require('lodash');
const Socket = require('socket.io');
const express = require('express');
const cors = require('cors');
const https = require('https-server');


// environment variables
require("dotenv").config();

// routes
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const coordinatorRoutes = require("./routes/coordinatorRoutes");

const app = express();

const server = app.listen(process.env.HTTP_PORT, process.env.HOST, () => {
    console.log(`Server listening to requests on port ${process.env.HTTP_PORT}`);
});

const options = {
    key : "Root",
    pass : "Root123"
};

const httpsServer = https.createServer(options,app);

httpsServer.listen(process.env.HTTPS_PORT, process.env.HOST)

// connection to db
// const dbURI = `mongodb+srv://${db.Uname}:${db.pass}@cluster0.xevnc.mongodb.net/${db.name}?retryWrites=true&w=majority`;
// mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true }).then((result) => {
//     console.log('Connected to db');
//     const port = 45000;
//     const server = app.listen(port, () => {
//         console.log(`Server listening to requests on port ${port}`);
//     });
// }).catch((err) => {
//     console.log(err);
// });

mongoose.connect('mongodb://localhost/TimeTable', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }).then(() => {
    console.log('Connected to db');
}).catch('error', (error) => console.log('\nError at ', error));

//static files
app.use(express.static('public'));

// render engine
app.set('view engine', 'ejs');

// middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.render('login');
});

// admin routes
app.use(adminRoutes);

// coordinator routes
app.use(coordinatorRoutes);

// auth routes
app.use(authRoutes);

// lecturerRoutes
app.use(userRoutes);

app.use((req, res) => {
    res.status(404).render('404');
});

function FindElement(criteria = '_id', value, source) {
    return _.find(source, (o) => { return o[criteria] === value; });
}

//socket setup
let io = Socket(server);
var connectedUsers = [];

io.on('connection', (socket) => {
    // handling disconnections
    socket.on('disconnect', () => {
        let person = FindElement('_id', socket.id, connectedUsers);
        connectedUsers.slice(person, 1);
        // console.log(connectedUsers)
    });

    console.log('New socket connection made', socket.id);

    socket.on('book-me', (user) => {
        user.networkId = socket.id;
        connectedUsers.push(user);

        io.to(socket.id).emit('book-me-res', {
            message: `${user._id}`
        });
    });

    socket.on('message', (msg) => {
        if (msg.receiver !== '') {
            connectedUsers.forEach((user) => {
                if (user.id === msg.receiver) {
                    io.to(user.networkId).emit('message', { sender: msg.sender, message: msg.message });
                }
            });
        } else { socket.broadcast.emit('message', { sender: msg.sender, message: msg.message }); }
    });
});