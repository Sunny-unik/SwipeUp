const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const nodemailer = require('nodemailer');
const upload = require('./multerConfig');
const path = require('path');
const jwt = require('jsonwebtoken');
const auth = require('./auth');
const { decode } = require('punycode');
require('dotenv').config();

const connectedUsers = [];
const app = express();
app.use(cors());
const server = require('http').Server(app);
const io = require('socket.io')(server);

const client = new MongoClient(process.env.MONGO_URI, { useNewURLParser: true, useUnifiedTopology: true });
let connection;
client.connect((err, db) => {
    if (!err) {
        connection = db;
        console.log("Database Connected Successfully");
    } else {
        console.log("Database could not connect");
    }
});

/* SOCKET */
io.on('connection', async (socket) => {
    console.log("some client connected");
    // require('./sockets/chat/joinedUser')(io, socket);
    // require('./sockets/chat/chatMessage')(io, socket);
    // require('./sockets/chat/disconnect')(io, socket);
    // require('./sockets/chat/privateMessage')(io, socket);
    // require('./sockets/chat/joinPrivateRoom')(io, socket);

    const random = Math.random();
    console.log(random);
    connectedUsers.push({ random, socket });
    socket.emit("random", random);
});

app.use(express.static(path.join(__dirname, "userImages")));

app.get('/list-account', (req, res) => {
    const userCollection = connection.db('SwipeUp').collection('Users');
    userCollection.find().toArray((err, docs) => {
        if (!err) {
            res.send({ status: "OK", data: docs });
        } else {
            res.send({ status: "Failed", data: err });
        }
    });
});

app.post('/create-account', bodyParser.json(), (req, res) => {
    const userCollection = connection.db('SwipeUp').collection('Users');
    userCollection.insert(req.body, (err, result) => {
        if (!err) {
            res.send({ status: "OK", data: "Account Created successfully. You can login now. You are redirected to login page." });
            sendMail(process.env.APP_ID, process.env.APP_PASSWORD, req.body.uemail,
                "Welcome to SwipUp", `<b> Registration successfully </b>   `);
        } else {
            res.send({ status: "Failed", data: err });
        }
    });
});

app.post('/valid-email', bodyParser.json(), (req, res) => {
    const userCollection = connection.db('SwipeUp').collection('Users');
    userCollection.find({ uemail: req.body.uemail }).toArray((err, result) => {
        if (!err && result.length > 0) {
            res.send({ status: 'error', data: "this email is already registered :(" });
        } else {
            res.send({ status: 'ok' });
        }
    });
});

app.post('/valid-username', bodyParser.json(), (req, res) => {
    const userCollection = connection.db('SwipeUp').collection('Users');
    userCollection.find({ uusername: req.body.uusername }).toArray((err, result) => {
        if (!err && result.length > 0) {
            res.send({ status: 'error', data: "this username is already registered :(" });
        } else {
            res.send({ status: 'ok' });
        }
    });
});

app.post("/send-user-otp", bodyParser.json(), (req, res) => {
    sendMail(process.env.APP_ID, process.env.APP_PASSWORD, req.body.uemail,
        "Welcome to SwipUp", `Your One Time Password is - <h3>${req.body.otp}</h3><br><h6>We hope you find our service cool.</h6>`);
    res.send({ status: "ok", data: "please verify your email" });
});

app.post('/check-login', bodyParser.json(), (req, res) => {
    const usercollection = connection.db('SwipeUp').collection('Users');
    usercollection.find({ $or: [{ uemail: req.body.email }, { uusername: req.body.email }], upassword: req.body.password }).toArray((err, result) => {
        if (!err && result.length > 0) {
            let token = jwt.sign({ username: result[0].uusername }, 'verySecretCode', { expiresIn: '7d' });
            console.log(token);
            res.send({ status: 'ok', data: { ...result[0], token } });
        } else {
            res.send({ status: 'error', data: err });
        }
    });
});

app.get('/validate', bodyParser.json(), auth, (req, res) => {
    const usercollection = connection.db('SwipeUp').collection('Users');
    const token = req.headers.authorization.split(' ')[1];
    const decodeToken = jwt.verify(token, 'verySecretCode');
    usercollection.findOne({ uusername: decodeToken.username }).then((result, err) => {
        if (result) {
            res.send({ status: 'ok', data: result });
        } else {
            res.send({ status: 'error', data: err });
        }
    });
});

// for forgot password
app.post('/user-by-email', bodyParser.json(), (req, res) => {
    const UserCollection = connection.db('SwipeUp').collection('Users');
    UserCollection.find({ uemail: (req.body.email) }).toArray((err, result) => {
        if (!err && result.length > 0) {
            res.send({ status: "ok", data: result });
            const n = result.map((e) => { return e.uusername; });
            const i = result.map((e) => { return e.upassword; });
            sendMail(process.env.APP_ID, process.env.APP_PASSWORD, req.body.email, "Welcome to SwipeUp", "<h3> your SwipeUp account  password is</h3>" + i + "<h3> your SwipeUp account  username is </h3>" + n);
        } else {
            res.send({ status: "failed", data: err });
        }
    });
});

app.post('/update-user', bodyParser.json(), (req, res) => {
    const userCollection = connection.db('SwipeUp').collection('Users');
    userCollection.update({ _id: ObjectId(req.body.userId) }, { $set: { uname: req.body.uname } }, (err, result) => {
        if (!err) {
            res.send({ status: "success", data: "user details updated sucessfully", allData: result });
        } else {
            res.send({ status: "failed", data: err });
        }
    });
});

app.post('/update-password', bodyParser.json(), (req, res) => {
    const userCollection = connection.db('SwipeUp').collection('Users');
    userCollection.updateOne({ $or: [{ uemail: req.body.email }, { uusername: req.body.email }] }, { $set: { upassword: req.body.newpassword } }, (err, result) => {
        if (!err) {
            res.send({ status: "success", data: "Password updated sucessfully" });
        } else {
            res.send({ status: "failed", data: err });
        }
    });
});

app.post('/update-profile', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            console.log("Error", err);
            res.send({ status: "failed", data: err });
        } else {
            const userCollection = connection.db('SwipeUp').collection('Users');
            userCollection.update({ _id: ObjectId(req.body._id) }, { $set: { profile: req.files.profile[0].filename } }, (err, result) => {
                if (!err) {
                    res.send({ status: "success", data: "Profile updated sucessfully" });
                } else {
                    res.send({ status: "failed", data: err });
                }
            });
        }
    });
});

app.post('/add-friend', bodyParser.json(), (req, res) => {
    const collection = connection.db('SwipeUp').collection('Users');
    const friend = req.body.uid;
    const myUsername = req.body.userUserName;
    collection.updateOne({ 'uusername': myUsername }, { $push: { friends: { name: friend, status: false, sent: true, recieved: false } } });
    collection.updateOne({ 'uusername': uid }, { $push: { friends: { name: myUsername, status: false, sent: false, recieved: true } } }
        , (err, result) => {
            if (!err) {
                res.send({ status: "ok", data: "Friend Request Sent" });
            } else {
                res.send({ status: "failed", data: "some error occured" });
            }
        });
});

app.post("/send-otp-email", bodyParser.json(), (req, res) => {
    const usercollection = connection.db('SwipeUp').collection('Users');
    usercollection.find({ $or: [{ uemail: req.body.email }, { uusername: req.body.email }] }).toArray((err, result) => {
        if (!err && result.length > 0) {
            console.log(req.body.otp);
            sendMail(process.env.APP_ID, process.env.APP_PASSWORD, result[0].uemail, "Welcome to SwipeUp",
                `Your One Time Password is - <h3>${req.body.otp}</h3><br><h6>We hope you find our service cool.</h6>`);
            res.send({ status: "ok", data: "please enter correct otp" });
        } else {
            res.send({ status: 'error', data: err });
        }
    });
});

app.post('/search-for-user', bodyParser.json(), (req, res) => {
    const collection = connection.db('SwipeUp').collection('Users');
    collection.find({ uusername: (req.body.friend) }).toArray((err, docs) => {
        if (!err) {
            res.send({ status: "ok", data: docs });
        } else {
            res.send({ status: "failed", data: "some error occured" });
        }
    });
});

app.post('/get-notif', bodyParser.json(), (req, res) => {
    const collection = connection.db('SwipeUp').collection('Users');
    collection.find({ uusername: (req.body.userUserName) }).toArray((err, docs) => {
        if (!err) {
            res.send({ status: "ok", data: docs });
        } else {
            res.send({ status: "failed", data: "some error occured" });
        }
    });
});

app.post('/get-userlist', bodyParser.json(), (req, res) => {
    const collection = connection.db('SwipeUp').collection('Users');
    collection.find({ uusername: (req.body.S) }).toArray((err, docs) => {
        if (!err) {
            res.send({ status: "ok", data: docs });
        } else {
            res.send({ status: "failed", data: "some error occured" });
        }
    });
});

app.post('/accept-request', bodyParser.json(), (req, res) => {
    const collection = connection.db('SwipeUp').collection('Users');
    const friend = req.body.friendReq;
    const username = req.body.userUserName;
    collection.updateOne({ "uusername": username, "friends": { $elemMatch: { "name": friend } } }, { $set: { "friends.$.status": true } });
    collection.updateOne({ "uusername": friend, "friends": { $elemMatch: { "name": username } } }, { $set: { "friends.$.status": true } }
        , (err, result) => {
            if (!err) {
                res.send({ status: "ok", data: "friend request accepted" });
            } else {
                res.send({ status: "failed", data: "some error occured" });
            }
        });
});

app.post('/unfriend-or-decline', bodyParser.json(), (req, res) => {
    const collection = connection.db('SwipeUp').collection('Users');
    // collection.updateOne({ "uusername": req.body.mine, "friends": { $elemMatch: { "name": req.body.frnd } } }, { $set: { "friends.$.name": "", "friends.$.status": false, "friends.$.recieved": false, "friends.$.sent": false } })
    // collection.updateOne({ "uusername": req.body.frnd, "friends": { $elemMatch: { "name": req.body.mine } } }, { $set: { "friends.$.name": "", "friends.$.status": false, "friends.$.recieved": false, "friends.$.sent": false } }
    collection.updateOne({ "uusername": req.body.mine }, { $pull: { friends: { "name": req.body.frnd } } });
    collection.updateOne({ "uusername": req.body.frnd }, { $pull: { friends: { "name": req.body.mine } } }
        , (err, result) => {
            if (!err) {
                res.send({ status: "ok", data: "friend unfriend or request declined" });
            } else {
                res.send({ status: "failed", data: "some error occured" });
            }
        });
});

app.post('/myFriends', bodyParser.json(), (req, res) => {
    const collection = connection.db('SwipeUp').collection('Users');
    collection.find({ uusername: (req.body.userUserName) }).toArray((err, docs) => {
        if (!err) {
            res.send({ status: "ok", data: docs });
        } else {
            res.send({ status: "failed", data: "some error occured" });
        }
    });
});

app.post('/friendData', bodyParser.json(), (req, res) => {
    const collection = connection.db('SwipeUp').collection('Users');
    collection.find({ uusername: (req.query.id) }).toArray((err, docs) => {
        if (!err) {
            res.send({ status: "ok", data: docs });
        } else {
            res.send({ status: "failed", data: "some error occured" });
        }
    });
});

app.post('/send-message', bodyParser.json(), (req, res) => {
    const collection = connection.db('SwipeUp').collection('Messages');
    collection.insertOne(req.body, (err, result) => {
        if (!err) {
            res.send({ status: "ok", data: "Message Sent" });
        } else {
            res.send({ status: "failed", data: "some error occured" });
        }
    });
});

// for retrieving Messages
app.post('/messages1', bodyParser.json(), (req, res) => {
    const collection = connection.db('SwipeUp').collection('Messages');
    collection.find({ userUserName: (req.body.userUserName) }).toArray((err, docs) => {
        if (!err) {
            res.send({ status: "ok", data: docs });
        } else {
            res.send({ status: "failed", data: "some error occured" });
        }
    });
});

// for retrieving messages
app.post('/messages2', bodyParser.json(), (req, res) => {
    const collection2 = connection.db('SwipeUp').collection('Messages');
    collection2.find({ userUserName: (req.body.fData) }).toArray((err, docs) => {
        if (!err) {
            res.send({ status: "ok", data: docs });
        } else {
            res.send({ status: "failed", data: "some error occured" });
        }
    });
});

// for delete a Messages
app.post('/delete-a-message', bodyParser.json(), (req, res) => {
    const collection = connection.db('SwipeUp').collection('Messages');
    collection.deleteOne({ messageid: (req.body.id) }, (err, result) => {
        if (!err) {
            res.send({ status: "OK", data: "Message Deleted successfully" });
        } else {
            res.send({ status: "Failed", data: err });
        }
    });
});

// delete all msg between two persons
app.post('/delete-all-message', bodyParser.json(), (req, res) => {
    const collection = connection.db('SwipeUp').collection('Messages');
    collection.deleteMany({ userUserName: (req.body.frnd), friendUsername: (req.body.mine) });
    collection.deleteMany({ userUserName: (req.body.mine), friendUsername: (req.body.frnd) }, (err, result) => {
        if (!err) {
            res.send({ status: "OK", data: "All Messages Deleted" });
        } else {
            res.send({ status: "Failed", data: err });
        }
    });
});

function sendMail(from, appPassword, to, subject, htmlmsg) {
    let transporter = nodemailer.createTransport(
        {
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: from,
                pass: appPassword
            }
        }
    );
    let mailOptions = {
        from: from,
        to: to,
        subject: subject,
        html: htmlmsg
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent:' + info.response);
        }
    });
}

server.listen(3001, () => {
    console.log("Server started on http://localhost:" + process.env.PORT);
});