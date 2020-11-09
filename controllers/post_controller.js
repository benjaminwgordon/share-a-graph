const router = require('express').Router();
const { response } = require('express');
const mongoose = require('mongoose');
const db = require('../models');

// base route is /posts

const requireAuth = (req, res, next) => {
    if (!req.session.currentUser){
        res.redirect('/login/register');
    } else{
        next()
    }
}


// INDEX
router.get('/', (req, res) => {
    db.Post.find({}, (err, posts) => {
        if (err){
            console.log(err);
        } else{
            res.render('posts/index', {posts, username: req.session.currentUserName, current_user: req.session.currentUser});
        }
    })
});


// SHOW
router.get('/:id', (req, res) => {
    db.Post.findById(req.params.id, (err, post)=>{
        if (err){
            console.log(err)
        }
        const userOwnsPost = (post.author == req.session.currentUser);
        res.render('posts/show', {post, userOwnsPost, username: req.session.currentUserName, current_user: req.session.currentUser})
    })
});


// EDIT
router.get('/:id/edit', requireAuth, async (req, res) => {
    try {
        const post = db.Post.findById(req.params.id);
        console.log("post" + post)
        console.log("post publisher" + post.author)
        console.log("current user" + req.session.currentUser)
        if (post.author == req.session.currentUser) {
            res.render('posts/edit', {username: req.session.currentUserName, current_user: req.session.currentUser}), {post}
        } else {
            res.redirect(`/posts/${req.params.id}/`)
        }
    } catch (error) {
        console.log(err);
        return next(err);
    }
});


// UPDATE
router.put('/:id', requireAuth, (req, res) => {
    db.Post.findByIdAndUpdate(req.params.id, req.body,(err, updatedPost)=>{
        if (err){
            console.log(err);
            res.send(err);
        }
        res.redirect(`/posts/${updatedPost._id}`)
    })
});


// DELETE
router.delete('/:id', requireAuth, (req, res) => {
    db.Post.findByIdAndDelete(req.params.id, (err, removedPost)=>{
        if (err){
            console.log(err)
        }
        res.redirect('/posts')
    })
});


module.exports = router;