const User = require('../database/User')
module.exports = (req, res) => {
    User.findOne({ _id: req.session.userId }, function(err, data) {
        // console.log("Data is " + data);
        // console.log("Unique id is" + req.session.userId);
        if (!data) {
            res.redirect('/');
        } else {
            // console.log("Coming here");
            res.render('profile', { "fname": data.fusername, "lname": data.lusername, "email": data.email, "password": data.password, "gender": data.gender });
            // console.log("Data " + data.username);

        }
    });

};