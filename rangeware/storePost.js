// module.exports = (req, res, next) => {
//     console.log("check request " + req);
//     if (!req.files) return res.redirect('/postnew.html');

//     if (!req.files.image || !req.body.username || !req.body.title || !req.body.description || !req.body.content) {
//         return res.redirect('/postnew.html')
//     }

//     next()
// }