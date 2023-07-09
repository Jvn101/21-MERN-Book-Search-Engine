//* `resolvers.js`: Define the query and mutation functionality to work with the Mongoose models.
//**Hint**: Use the functionality in the `user-controller.js` as a guide.

const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
    me: async (_, __, {user}) => {
        if (user) {
            const userData = await User.findOne({ _id: user._id })
            .select('-__v -password')
            return userData;
        }
        throw new AuthenticationError('Error! You are not logged in');
    },
}, 
Mutation: {
    addUser: async (parent, args) => {
        const user = await User.create(args);
        const token = signToken(user);

        return { token, user };
    },
    login: async (parent, { email, password }) => {
        const user = await User.findOne( { email });
        if (!user) {
            throw new AuthenticationError('No user found')
        }
        const correctPw = await user.isCorrectPassword(password);
        if(!correctPw) {
            throw new AuthenticationError('No user found')
        }
        const token = signToken(user);
        return { token, user };
    },
    saveBook: async (parent, { newbook }, context) => {
        if (context.user) {
            const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $addToSet: {savedBooks: newbook} },
                { new: true }
            )
            return updatedUser;
        }
        throw new AuthenticationError('Please login first!')
    },
    removeBook: async (parent, { bookId }, context) => {
        if (context.user) {
            const updatedUser = await User.findOneAndUpdate(
                {_id: context.user._id},
                { $pull: { savedBooks: { bookId: bookId } } },
                { new: true }
            )
            return updatedUser;
        }
        throw new AuthenticationError('Please login first!');
        },
}
};


module.exports = resolvers;