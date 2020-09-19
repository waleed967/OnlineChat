const User = require('../database/User')
module.exports = (req, res) => {
    User.findOne({ _id: req.session.userId }, function(err, data) {
        console.log("Data is " + data);
        console.log("Unique id is" + req.session.userId);
        if (!data) {
            res.redirect('/');
        } else {
            console.log("Coming here");
            return res.render('layouts/app', { "name": data.username, "email": data.email });
        }
    });
    res.redirect('/auth-login')
};