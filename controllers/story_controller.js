const db = require('../models');

const router = require('express').Router()

// base route is /stories

const requireAuth = (req, res, next) => {
    if (!req.session.currentUser){
        res.redirect('/login/register');
    } else {
        next();
    }
};


// INDEX
router.get('/', (req, res) => {
    db.Story.find({}).populate({
        path: 'publisher',
        model: 'User'
    }).exec((err, stories) => {
        if (err){
            console.log(err);
            return next(err);
        } else{
            console.log(stories[0])
            res.render('stories/index', {stories, username: req.session.currentUserName, current_user: req.session.currentUser})
        }
    })
});



// NEW
router.get('/new', requireAuth, (req, res) => {
    res.render('stories/new', { username: req.session.currentUserName, current_user: req.session.currentUser});
});


// CREATE
router.post('/', requireAuth, async (req, res) => {
    try{
        const user = await db.User.findById(req.session.currentUser);
        req.body.publisher = user._id;
        const newStory = await db.Story.create(req.body)
        user.publishedStories.push(newStory);
        user.save();
        console.log(newStory);
        console.log(user);
        res.redirect(`/stories`);
    } catch(err){
        console.log(err);
        res.render('error', {error:'internal server error'});
    }
});


// SHOW
router.get('/:id', async (req, res, next) => {
    try{
        // nested populate to grab all posts belonging to this story, and grab all usernames from those authors
        const story = await db.Story.findById(req.params.id)
        .populate({
            path: 'content',
            model: 'Post',
            populate: {
                path:'author',
                model: 'User'
            }
        });
        const userOwnsResource = (story.publisher == req.session.currentUser);
        res.render('stories/show', {story, userOwnsResource, username: req.session.currentUserName, current_user: req.session.currentUser})    
    } catch(err){
        console.log(err);
        return next(err);
    }
});


// EDIT
router.get('/:id/edit', requireAuth, async (req, res) => {
    try{
        const story = await db.Story.findById(req.params.id);
        console.log("story", story)
        console.log("currentUser:" ,req.session.currentUser)
        if (story.publisher == req.session.currentUser){
            res.render('stories/edit', {story, username: req.session.currentUserName, current_user: req.session.currentUser})
        } else {
            res.redirect(`/stories/${req.params.id}/`)
        }
    } catch(err){
        console.log(err);
        return next(err);
    }
});


// UPDATE
router.put('/:id', requireAuth, async (req, res) => {
    try{
        const story = await db.Story.findById(req.params.id);
        if (story.publisher == req.session.currentUser){
            await db.Story.findByIdAndUpdate(req.params.id, req.body);
        }
        res.redirect(`/stories/${req.params.id}`)
    } catch(err){
        console.log(err);
        res.render('error', {error:'internal server error'});
    }
});


// DELETE
router.delete('/:id', requireAuth, async (req, res) => {
    try{
        const story = await db.Story.findById(req.params.id);
        if (story.publisher == req.session.currentUser){
            await db.Story.findByIdAndDelete(req.params.id)
            res.redirect('/stories')
        } else{
            res.redirect(`/stories/${req.params.id}`)
        }
    } catch (err){
        console.log(err);
        res.render('error', {error:'internal server error'});
    }
});


const story_post_controller = require('./stories_posts_controller');
router.use('/:id/posts', story_post_controller);

module.exports = router;
