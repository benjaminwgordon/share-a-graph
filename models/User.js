const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    // Model references
    publishedStories: [{type: Schema.Types.ObjectId, ref: "Author"}],
    authoredPosts: [{type: Schema.Types.ObjectId, ref: "Post"}],

    username: {type:String, required:true},
    aboutInfo: {type:String, maxLength:300},
    profileImage: {type:String},
    /* ICEBOX FIELDS */
    //tags: [{type:String}],
    // likedPosts: [{type: Schema.Types.ObjectId, ref: "Post"}],
    // dislikedPosts: [{type: Schema.Types.ObjectId, ref: "Post"}],
    // totalUpvotes: {type: Number, default:0},
    // totalDownvotes: {type:Number, default:0}
},{
    timestamps:true,
    createdAt: "publishedAt"
});

module.exports = mongoose.model("User", userSchema);