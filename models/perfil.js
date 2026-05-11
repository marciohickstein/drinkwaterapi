const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const perfilSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    passwd: {
        type: String,
        required: true,
        select: false
    },
    weight: {
        type: Number,
        required: true,
        default: 70
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save hook to hash password
perfilSchema.pre('save', async function(next) {
    // Only hash if password is modified
    if (!this.isModified('passwd')) return next();

    // Hash password with cost of 12
    this.passwd = await bcrypt.hash(this.passwd, 12);
    next();
});

// Instance method to check password
perfilSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.passwd);
};

module.exports = mongoose.model('Perfil', perfilSchema);
