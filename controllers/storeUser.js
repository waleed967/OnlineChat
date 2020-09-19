const User = require('../database/User')
addrs = require("email-addresses")

module.exports = (req, res) => {
    console.log("trying to store user");
    em = addrs.parseOneAddress(req.body.email);

    if (em["domain"] != "gmail.com") {
        console.log("Not allowed");
        console.log("error storing user, retry");
        req.flash('registrationErrors', "Only gmail allowed")
        return res.redirect('/auth-register');
    } else {
        User.create(req.body, (error, user) => {
            if (error) {
                console.log("error storing user, retry");
                const registrationErrors = Object.keys(error.errors).map(key => error.errors[key].message)
                req.flash('registrationErrors', registrationErrors)
                return res.redirect('/auth-register');
            }
            res.redirect('/');
        })
    }

}