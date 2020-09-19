const Post = require('../database/Post')
module.exports = async(req, res) => {
    const posts = await Post.find({});

    res.render("index", {
        posts
    });
}