const User = require('../models/User')
const bcrypt = require('bcryptjs')
const validator = require('validator')

module.exports = {
    hello() {
        return {
            text: "Hello World!",
            views: 1
        }

    },
    createUser: async function ({userInput}, req) {
        const errors = []

        console.log(userInput)
        if (!validator.isEmail(userInput.email)) {
            errors.push({message: 'Email is invalid'})
        }

        if (
            !userInput.password ||
            validator.isEmpty(userInput.password) ||
            !validator.isLength(userInput.password, {min: 5})
        ) {
            errors.push({message: 'Password must be at least 5 characters long'});
        }

        if (errors.length > 0) {
            const error = new Error('Invalid input!')
            error.data = errors;
            error.code = 422;
            throw error;
        }

        const existingUser = await User.findOne({
            where: {email: userInput.email}
        });
        if (existingUser) {
            throw new Error('User already exists');
        }
        const hashedPassword = await bcrypt.hash(userInput.password, 10);
        const createdUser = await User.create({
            email: userInput.email,
            password: hashedPassword,
            name: userInput.name,
        });

        return {
            id: createdUser.id,
            email: createdUser.email,
            name: createdUser.name,
            posts: []
        };
    }
}
