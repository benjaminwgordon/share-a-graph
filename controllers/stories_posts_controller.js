const db = require('../models');

const router = require('express').Router({mergeParams: true})

// base route is /stories/:id/posts

const requireAuth = (req, res, next) => {
    if (!req.session.currentUser){
        res.redirect('/login/register');
    } else {
        next();
    }
};


// INDEX
router.get('/', (req, res) => {
    db.Post.find({Author: req.params.id}, (err, posts) => {
        if (err){
            console.log(err)
        }
        res.render('posts/index', {posts, username: req.session.currentUserName, current_user: req.session.currentUser});
    })
});


// CREATE
router.post('/', requireAuth, async (req, res) => {
    try{
        //check logged in user is valid before setting its value to post
        const author = await db.User.findById(req.session.currentUser);
        req.body.author = author._id;
        const post = await db.Post.create(req.body);
        const story = await db.Story.findById(req.params.id);
        story.content.push(post);
        story.save();
        author.authoredPosts.push(post);
        await author.save();
        res.redirect(`/stories/${req.params.id}`)
    } catch (err){
        console.log(err);
        return next(err);
    }
});


// EDIT
router.get('/:post_id/edit', async (req, res) => {
    try{
        const story_post = await db.Post.findById(req.params.post_id);
        const story = await db.Story.findById(req.params.id);
        if (req.session.currentUser == story_post.author){
            res.render('posts/edit', {story_post, story, username: req.session.currentUserName, current_user: req.session.currentUser})
        } else{
            res.redirect(`stories/${req.params.id}`)
        }
    } catch(err){
        console.log(err);
        res.send(err);
    }
});
   


// UPDATE
router.put('/:post_id', async (req, res) => {
    try{
        const story_post = await db.Post.findById(req.params.post_id);
        if (req.session.currentUser == story_post.author){
            await db.Post.findByIdAndUpdate(req.params.post_id, req.body);
        }
        res.redirect(`/stories/${req.params.id}`);
    } catch(err){
        console.log(err);
        res.render('error', {error:'internal server error'});
    }
});



// DELETE
router.delete('/:id', async (req, res) => {
    try{
        const story_post = await db.Post.findById(req.params.post_id);
        if (req.session.currentUser == story_post.author){
            await db.Post.findByIdAndDelete(req.params.post_id)
        }
        res.redirect(`/stories/${req.params.id}`)
    } catch(err){
        console.log(err);
        res.render('error', {error:'internal server error'});
    }
});

module.exports = router;