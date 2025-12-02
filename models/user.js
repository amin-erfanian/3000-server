const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profile: {
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        default: '',
      },
      gender: {
        type: String,
        default: '',
      },
      birthdate: {
        type: String,
        default: '',
      },
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) {
//     return next();
//   }
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
