const { buildSchema } = require('graphql');

module.exports = buildSchema(`
  type Post {
    _id: ID!
    title: String!
    content: String!
    imageURL: String!
    creator: User!
    createdAt: String!
    updatedAt: String!
  }

  type User {
    _id: ID!
    email: String!
    password: String
    name: String!
    status: String!
    posts: [Post!]!
  }

  input UserInputData {
    email: String!
    password: String!
    name: String!
  }

  type AuthData {
    token: String!
    userId: String!
  }

  type RootQuery {
    login(email: String!, password: String!): AuthData!
  }

  type RootMutation {
    createUser(userInput: UserInputData): User!
  }
  
  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);
