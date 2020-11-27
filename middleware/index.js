var middleware = {};

middleware.isAuthenticated = (req, res, next) => {
    if (req.session.authenticated) {
        return next();
    }
    const title = "Error!";
    content = { "html": "<h1>You do not have access to this page! Please <a href='/users/login'>Login</a> to view this content</h1>" }
    // Render a subpage with the error
    res.render('subpage', { title, content, menu: [], logged: req.session.authenticated, user: req.session.username });
}

module.exports = middleware;