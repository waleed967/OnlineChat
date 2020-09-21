const User = require('../database/User')
module.exports = (req, res) => {
    User.findOneAndUpdate({ username: req.session.name }, function(err, data) {
        // console.log("Data is " + data);
        // console.log("Unique id is" + req.session.userId);
        if (!data) {
            res.redirect('/');
        } else {
            // console.log("Coming here");

            res.render('profile', { "name": data.username });
            // console.log("Data " + data.username);
            // console.log(up);
        }
    });

};