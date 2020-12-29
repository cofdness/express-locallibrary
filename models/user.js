const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const userSchema = new Schema({
    email: {type: String, unique: true, required: true, trim: true},
    name: {type: String, required: true, trim: true},
    password: {type: String, required: true}
})

userSchema.statics.authenticate = (email, password, next) => {
    User.findOne({email: email})
        .exec((err, user) => {
            if (err) return next(err);
            if (!user) {
                const error = new Error('User not found');
                error.status = 401;
                return next(error);
            }
            bcrypt.compare(password, user.password, (err, result) => {
                if (result) {
                    return next(null, user);
                } else {
                    return next();
                }
            })
        })
}

//hash password before save
userSchema.pre('save', function (next) {
    const user = this;
    bcrypt.hash(user.password, 10, (err, hash) => {
        if (err) return next(err);
        user.password = hash;
        next();
    })
})


const User = mongoose.model('User', userSchema);

module.exports = User;