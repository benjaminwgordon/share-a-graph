const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    // Model References
    author: {type: Schema.Types.ObjectId, required:true},
    body: {type:String, required:true},

    /* ICEBOX FIELDS */
    // upvotes: {type:Number, default:0},
    // downvotes: {type:Number, default:0}
},
{
    timestamps: true,
    createdAt: "publishedAt"
});

module.exports = mongoose.model("Post", postSchema);