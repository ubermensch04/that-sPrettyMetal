const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        username:{
            type: String,
            required: [true, 'Username is required.'],
            unique: true,
            trim: true,
            lowercase: true
        },
        password:{
            type: String,
            required:[true, 'Password is required.'],
            minlength: [6, 'Password must be at least 6 characters long.']
        },
        role:{
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        }
    }, {timestamps: true}
);

userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next();

    try{
        const salt= await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    }
    catch(error)
    {
        next(error);
    }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) 
    {
        throw new Error('Error comparing passwords');
    }
}

const User= mongoose.model('User', userSchema);
module.exports = User;