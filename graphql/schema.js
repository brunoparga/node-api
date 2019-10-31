const { buildSchema } = require('graphql');

module.exports = buildSchema(`
  type AuthData {
    token: String!
    userId: String!
  }

  type Post {
    _id: ID!
    title: String!
    content: String!
    imageURL: String!
    creator: User!
    createdAt: String!
    updatedAt: String!
  }

  input PostInputData {
    title: String!
    content: String!
    imageURL: String!
  }

  type PostList {
    posts: [Post!]!
    totalPosts: Int!
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

  type RootMutation {
    createUser(userInput: UserInputData): User!
    createPost(postInput: PostInputData): Post!
  }
  
  type RootQuery {
    login(email: String!, password: String!): AuthData!
    posts(page: Int!): PostList!
  }
  
  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);
