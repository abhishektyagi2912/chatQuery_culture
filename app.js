var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var authRouter = require('./routes/auth');
var allchatRouter = require('./routes/allchats');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const middleware = require('./middlewares/auth');
const socket = require('./routes/socketchats');

dotenv.config();
app.set('view engine', 'ejs');
app.use(cors());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/auth', authRouter);
app.use('/chat', allchatRouter);

app.get('/', (req, res) => {
    res.render('home');
});

// app.use((req, res) => {
//     res.render('error');
// });


const uri = process.env.MONGO_URL;
mongoose
  .connect(uri)
  .then(() => {
    console.log("Database connected");
  })
  .catch((e) => {
    console.log(e);
    console.log("Database Falied");
  });

const server=app.listen(process.env.PORT,()=>{
    console.log("Listening on Port: ",process.env.PORT)
})

const io = require('socket.io')(server, {
    pingTimeout: 90000,
});

socket(io);