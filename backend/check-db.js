require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
    .then(() => mongoose.connection.db.collection('users').find({ $or: [{ email: /ankan/i }, { username: /Lightn/i }] }).toArray())
    .then(users => console.log(JSON.stringify(users.map(u => ({ user: u.username, email: u.email, isVerified: u.isVerified, otp: u.otp })), null, 2)))
    .then(() => process.exit(0))
    .catch(err => { console.error(err); process.exit(1); });
