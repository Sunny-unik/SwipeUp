const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, 'verySecretCode');
        req.user = decode;
        next();
    }
    catch (error) {
        res.send('token expired');
    }
};

module.exports = auth;