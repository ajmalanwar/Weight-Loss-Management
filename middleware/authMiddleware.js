function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        return next(); // User is authenticated, proceed to the next middleware/route handler
    }
 
    res.redirect('/login?alert=You have to login first');
}

module.exports = isAuthenticated;
