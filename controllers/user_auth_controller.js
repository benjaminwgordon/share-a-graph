const router = require('express').Router();
const db = require('../models');
const bcrypt = require('bcryptjs');


// register form
router.get('/register', (req, res) => {
    //if already logged in redirect
    if (req.session.currentUser){
        return res.redirect('/stories')
    }
    res.render('auth/register', {current_user: req.session.currentUser, username: req.session.username});
});


// register post
router.post('/register', async (req, res) => {
    try {
        const foundUser_auth = await db.User_auth.findOne({ email: req.body.email });
        if(foundUser_auth) {
            return res.send({ message: 'Account is already registered!'});
        }
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.password, salt);
        req.body.password = hash;
        const newUser = await db.User.create({
            username: req.body.username
        });
        req.body.user = newUser._id;
        const newAuth = await db.User_auth.create(req.body);
        res.redirect('/login/login');
    } catch (error) {
        res.render('error', {error:'internal server error'});
    }
});


// login form
router.get('/login', (req, res) => {
    //if already logged in redirect
    if (req.session.currentUser){
        return res.redirect('/stories')
    }
    res.render('auth/login', {reason: req.query.for, current_user: req.session.currentUser, username: req.session.username});
});


// login post <- authentication
router.post('/login', async (req, res) => {
    try {
        //TODO test for either username or password as sign-in
        const foundUser_auth = await db.User_auth.findOne({ email: req.body.email });
        if(!foundUser_auth) {
            return res.render('error',{ error: 'Email or Password is incorrect!'});
        }
        const match = await bcrypt.compare(req.body.password, foundUser_auth.password);
        if(!match) {
            return res.render('error',{ error: 'Email or Password is incorrect!'});
        }
        if(!foundUser_auth.user){
            res.render('error', {error: "This account has been deleted"})
        }
        req.session.currentUser = foundUser_auth.user;
        req.session.currentUserName = foundUser_auth.username;
        
        //TODO currently directs to /users
        res.redirect('/stories');
    } catch (error) {
        res.render('error', {error:'internal server error'});
    }
});

// logout delete <- destroy session
router.delete('/logout', async (req, res) => {
    console.log("called");
    await req.session.destroy();
    res.redirect('/login/login');
});


module.exports = router;
