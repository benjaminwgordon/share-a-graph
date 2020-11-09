const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const storySchema = new Schema({
    // model references
    publisher: {type: Schema.Types.ObjectId, required: true},
    authors: [{type:Schema.Types.ObjectId, ref: "User"}],
    content: [{type:Schema.Types.ObjectId, ref: "Post"}],

    name: {type:String, required:true, unique:true},
    description: {type:String, required:true, maxLength: 300},
    blurb: {type:String, required:true, maxLength: 300},
    postCharCount: {type:Number, default:1000, min: 0, max:5000},
    maxPosts: {type:Number, default:50, min: 0, max:200}
    /* TODO Can we add a dropdown list of genres?
    genre: {[
        {
        "fantasy",
        "drama",
        "sci-fi",
        "action",
        "romance"
    }]}, */

    /* ICEBOX FIELDS */
    // tags:[{type:String}]
})

module.exports = mongoose.model("Story", storySchema);