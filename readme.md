
# Social Media Backend API

A robust backend for a social media platform built with the MERN stack. This project supports user management, post creation, likes, comments, follows, and other essential social media functionalities.

## Table of Contents

- [Model Link](#model-link)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
  - [Authentication](#authentication)
  - [User](#user)
  - [Post](#post)
  - [Comment](#comment)
  - [Like](#like)
  - [Follow](#follow)
  - [Save](#save)
- [Middleware](#middleware)
- [Error Handling and Api Response](#error-handling-and-api-response)
- [Contributing](#contributing)

## Model Link
This application uses Mongoose models to structure the data and define relationships between entities. You can see the Data Model of this application at [Model Link](https://app.eraser.io/workspace/jvM6qS4vhDutksnXXIaH?origin=share)
## Features

- **User Authentication**: Register, login, logout, password management, avatar uploads.
- **User Profile**: Private and public profiles with bio, followers, and followings.
- **Posts**: CRUD operations on posts, images, captions.
- **Likes & Comments**: Like and comment on posts with tracking for each user.
- **Following System**: Follow/unfollow users, view followers and followings.
- **Saved Posts**: Save posts for viewing later.
- **Pagination**: Support for paginated responses in multiple endpoints.
## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **File Storage**: Cloudinary (for image uploads)
- **Authentication**: JSON Web Tokens (JWT)
- **Password Hashing**: bcrypt
- **Other Libraries**: mongoose-aggregate-paginate-v2, multer for file uploads
## Project Structure

```plaintext
src
├── controllers          # API controllers
├── middlewares          # Authentication and other middlewares
├── models               # Mongoose models for User, Post, etc.
├── routes               # Express routes for each resource
├── utils                # Utilities and helpers
├── db                   # Database connection and setup configurations
├── app.js               # Express app setup and configuration
├── constants.js         # Application-wide constantsconfiguration
└── index.js             # Entry point to start the server
```
## Setup & Installation

- Clone the repository:

```bash
  git clone https://github.com/AnmolGoyal01/social-media.git
  cd social-media-backend
```
    
- Install dependencies:

```bash
  npm install
```
- Configure environment variables: Create a .env file at the root level and add the following variables:

```bash
  PORT=4000
  CORS_ORIGIN =*
  MONGO_URI=<Your MongoDB URI>
  ACCESS_TOKEN_SECRET=<Your ACCESS_TOKEN_SECRET key>
  ACCESS_TOKEN_EXPIRY=1d
  REFRESH_TOKEN_SECRET=<Your REFRESH_TOKEN_SECRET key>
  REFRESH_TOKEN_EXPIRY=10d
  CLOUDINARY_CLOUD_NAME=<Your Cloudinary Cloud Name>
  CLOUDINARY_API_KEY=<Your Cloudinary API Key>
  CLOUDINARY_API_SECRET=<Your Cloudinary API Secret>

```
    
- Run in Development:

```bash
  npm run dev

```

The server should now be running at `http://localhost:4000`
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`PORT`
`CORS_ORIGIN`
`MONGO_URI`
`ACCESS_TOKEN_SECRET`
`ACCESS_TOKEN_EXPIRY`
`REFRESH_TOKEN_SECRET`
`REFRESH_TOKEN_EXPIRY`
`CLOUDINARY_CLOUD_NAME`
`CLOUDINARY_API_KEY`
`CLOUDINARY_API_SECRET`


## API Documentation

#### Authentication
-  Register User: `POST api/v1/users/register`
-  Login User: `POST api/v1/users/login`
-  Logout User: `POST api/v1/users/logout`
-  Change Password: `POST api/v1/users/change-password`
-  Refresh Access Token: `POST api/v1/users/refresh-token`


#### User
-  Get Current User: `GET api/v1/users/current-user`
-  Get User Profile: `GET api/v1/users/u/:username`
-  Get User Feed: `GET api/v1/users/feed`
-  Update Avatar: `PATCH api/v1/users/avatar`
-  Toggle Private account: `PATCH api/v1/users/privateAccount`
-  Update Bio: `PATCH api/v1/users/bio`
-  Update Full Name: `PATCH api/v1/users/fullName`
-  Update username: `PATCH api/v1/users/username`

#### Post
-  Create Post: `POST api/v1/posts/`
-  Get All Posts: `GET api/v1/posts/`
-  Get Post by ID: `GET api/v1/posts/:id`
-  Update Post: `PATCH api/v1/posts/:id`
-  Delete Post: `DELETE api/v1/posts/:id`
-  Toggle Like on Post: `POST api/v1/posts/:id/toggle-like`

#### Comment
-  Add Comment: `POST api/v1/comments/p/:id`
-  Get Comment: `POST api/v1/comments/p/:id`
-  Delete Comment: `DELETE api/v1/comments/c/:commentId`

#### Like
-  Like/Unlike Post: `POST api/v1/likes/p/:id`
-  Get Likes on Post: `GET api/v1/likes/p/:id`

#### Follow
-  Toggle Follow User: `POST api/v1/follow-relationships/follow/:id`
-  Get User's Followers: `GET api/v1/follow-relationships/followers/:username`
-  Get User's Followings: `GET api/v1/follow-relationships/followings/:username`

#### Save
-  Save/Unsave Post: `POST api/v1/save/p/:id`
-  Get Saved Posts: `GET api/v1/save/saved`
## Middlewares
#### 1. Authentication Middleware (`verifyJwt`) : Protects routes by verifying JWT tokens.
#### 2. Multer Middleware (`upload`) : Handles file uploads, especially avatars and post images.
#### 3. Post Auth Middleware (`canViewPost`) : Protects unauthorized access of private posts.
## Error Handling and Api Response

This application includes a robust error-handling system and custom response handling to ensure consistency and clarity in API responses.
- Error Handling: The `ApiError` utility class is used for creating custom errors with specific HTTP statuses and messages. Any API error that occurs will be thrown as an `ApiError` instance and caught by the error handler, which then sends a standardized JSON response with the error code and message.
- Custom API Response: All successful responses are wrapped in the `ApiResponse` class to maintain a consistent structure. Each response includes an HTTP status code, a data payload (if applicable), and a message, ensuring all client responses follow the same structure.
## Contributing

Contributions are welcome! Please follow these steps:

##### 1. Fork the repository.
##### 2. Create a new branch (`git checkout -b feature/your-feature-name`)
##### 3. Commit your changes (` git commit -m 'Add some feature `)
##### 4. Push to the branch (`git push origin feature/your-feature-name`)
##### 5. Create a Pull Request.
## 🔗 Links
[![portfolio](https://img.shields.io/badge/my_portfolio-000?style=for-the-badge&logo=ko-fi&logoColor=white)](https://anmolgoyal.me/)
[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/anmol-goyal-358804235/)
[![twitter](https://img.shields.io/badge/github-010101?style=for-the-badge&logo=github&logoColor=white)](https://anmolgoyal.me/_next/static/media/github-icon.04fa7de0.svg)

