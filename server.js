/* --------- EXTERNAL MODULES --------- */ 
const express = require('express');
const methodOverride = require('method-override');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const path = require('path');

// Security
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");

// logging
const morgan = require('mongoose-morgan');

/* --------- INTERNAL MODULES --------- */ 
const user_auth_controller = require('./controllers/user_auth_controller')
const post_controller = require('./controllers/post_controller');
const user_controller = require('./controllers/user_controller');
const story_controller = require('./controllers/story_controller');

/* --------- INSTANCED MODULES --------- */ 
const app = express();

/* -------------- Configs ------------- */ 
const PORT = process.env.PORT || 3000;
app.set("view engine", "ejs");
require("dotenv").config();
const corsOptions = {
    origin:["https://share-a-graph.herokuapp.com/"],
    optionsSuccessStatus: 200
}

const limitOptions = rateLimit({
    max:10000,
    windowsMS:24 * 60 * 60 * 1000,
    message:"Too many requests"
})

const morganOptions = {
    connectionString: process.env.CONNECTION_STRING
}

const sessionOptions = { 
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
    store: new MongoStore({
        url: process.env.CONNECTION_STRING,
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 * 2
    }
}

/* ------------ MIDDLEWARE ------------ */ 
app.use(cors(corsOptions));
app.use(limitOptions);
app.use(helmet.contentSecurityPolicy({
    directives:{
      defaultSrc:["'self'"],
      scriptSrc:["'self'"],
      styleSrc:["'self'","'unsafe-inline'",'https://cdn.jsdelivr.net', 'https://use.fontawesome.com'],
      fontSrc:["'self'", 'https://use.fontawesome.com'],
      imgSrc: ["'self'", '*']
    }
}));
app.use(mongoSanitize());
app.use(morgan(morganOptions));

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));

/* ------- UserAuth & Session --------- */
app.use(session(sessionOptions));

/* -------------- Routes -------------- */ 
app.use('/static', express.static(path.join(__dirname, 'public')))

// User_auth Route
app.use('/login', user_auth_controller);
// Keep routes separated to prepare for icebox auth functionality
app.use('/users', user_controller);
app.use('/stories', story_controller);
app.use('/posts', post_controller);

app.get('/', (req, res) => {
    res.redirect('/login/login')
});

app.get('/*', (req,res)=>{
    res.status(404).render('error', {error: '404: Resource Not Found'});
})

app.use((req,res)=>{
    res.status(403).render('error', {error: '403: Forbidden'});
})

app.listen(PORT, ()=>{
    console.log(`listening on port: ${PORT}`)
})