const User = require('../database/User');

module.exports = async(req, res) => {
    const user = await User.findById(req.params.userId);
    res.render("user", {
        user

    });
}