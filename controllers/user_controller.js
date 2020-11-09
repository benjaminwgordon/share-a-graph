const router = require('express').Router();
const mongoose = require('mongoose');
const db = require('../models');


// base route is /users


// INDEX
router.get('/', async (req, res) => {
    try{
        const allUsers = await db.User.find({})
        console.log(allUsers)
        const loggedInUser = await db.User.findById(req.session.currentUser);
        res.render('users/index', {allUsers, loggedInUser,  username: req.session.currentUserName, current_user: req.session.currentUser})
    } catch (err){
        console.log(err);
        next(err);
    }
});

// SHOW
router.get('/:id', async (req,res) => {
    try{
        const oneUser = await db.User.findById(req.params.id).populate({
            path:'publishedStories',
            model:'Story'
        }).exec();
        console.log(oneUser)
        const userOwnsProfile = (oneUser._id == req.session.currentUser);
        console.log(userOwnsProfile);
        res.render('users/show', {oneUser, userOwnsProfile,  username: req.session.currentUserName, current_user: req.session.currentUser});
    } catch(err){
        console.log(err);
        res.render('error', {error:'internal server error'});
    }
}); 


// EDIT
router.get('/:id/edit', (req,res) => {
    db.User.findById(req.params.id, (err, oneUser) => {
        if(err) {
            console.log(err);
            return res.send(err);
        }
        if (!(req.session.currentUser == oneUser._id)){
            res.redirect(`/users/${req.params.id}`);
        } else{
            res.render('users/edit', {oneUser,  username: req.session.currentUserName, current_user: req.session.currentUser});
        }
    })
}); 


// UPDATE
router.put('/:id', async (req, res) => {
    try{
        const owner = await db.User.findById(req.params.id);
        if (req.session.currentUser == owner._id){
            const userAuth = await db.User_auth.findOne({username: owner.username});
            userAuth.username = req.body.username;
            await userAuth.save();
            await db.User.findByIdAndUpdate(req.params.id, req.body, { new: true });
            req.session.currentUserName = owner.username;
            res.redirect(`/users/${req.params.id}`);
        } else{
            res.redirect(`/users/${owner._id}`);
        }
    } 
    catch (err){
        console.log(err)
        res.render('error', {error:'internal server error'});
    }
});


//DELETE
router.delete('/:id', async (req,res) => {
    try{
        const owner = await db.User.findById(req.params.id);
        if (req.session.currentUser == owner._id){
            console.log("current user owns this account")
            const deletedUser = await db.User.findByIdAndDelete(req.params.id);
            //TODO: anonymize all associated stories and posts

            await db.Post.findAndDelete({author: deletedUser._id});

            console.log("deleted user: ", deletedUser);
            // remove any associations to an authentication model
            const deletedUserAuth = await db.User_auth.findOne({user: deletedUser._id});
            console.log("deletedUserAuth:" ,deletedUserAuth);
            deletedUserAuth.user = null;
            await deletedUserAuth.save();

            // delete session data
            await req.session.destroy();
            res.redirect(`/stories`);
        } else{
            res.redirect(`/users/${owner._id}`);
        }
    } 
    catch (err){
        console.log(err)
        res.render('error', {error:'internal server error'});
    }
});


module.exports = router;
