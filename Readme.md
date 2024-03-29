# VideoTube Backend

## Description
VideoTube is a backend project built using JavaScript, Express.js, and MongoDB in the guidance of youtuber [Hitesh Choudhary](Chai Aur Code). It provides APIs for managing videos, user authentication, likes, subscriptions, comments, tweets, playlists, health checks, and dashboard functionalities.

## Features
- User authentication using JWT (JSON Web Tokens)
- Video upload and management
- Integration with Cloudinary for storing and managing video files
- Pagination of video data
- Like, subscription, comment, tweet, and playlist functionalities
- Health checks for monitoring server status
- Dashboard for monitoring system metrics

## Dependencies
- bcrypt: ^5.1.1
- cloudinary: ^2.0.3
- cookie-parser: ^1.4.6
- cors: ^2.8.5
- dotenv: ^16.4.5
- express: ^4.18.3
- jsonwebtoken: ^9.0.2
- lodash: ^4.17.21
- mongoose: ^8.2.1
- mongoose-aggregate-paginate-v2: ^1.0.7
- multer: ^1.4.5-lts.1
- nodemon: ^3.1.0

## Installation
1. Clone the repository: `git clone https://github.com/Klnishant/ChaiAurBackEnd`
2. Install dependencies: `npm install`
3. Set up environment variables by creating a `.env` file and adding necessary configurations (e.g., MongoDB URI, Cloudinary credentials, JWT secret)
4. Run the server: `npm start`

## Models
- User
- Video
- Like
- Subscription
- Comment
- Tweet
- Playlist

## Controllers
- User controller
- Video controller
- Like controller
- Subscription controller
- Comment controller
- Tweet controller
- Playlist controller
- Health check controller
- Dashboard controller

## Routes
- User routes
- Video routes
- Like routes
- Subscription routes
- Comment routes
- Tweet routes
- Playlist routes
- Health check routes
- Dashboard routes

## Environment Variables
Ensure to set the following environment variables in a `.env` file:
- `PORT`: Port number for the server (default: 3000)
- `MONGODB_URI`: MongoDB connection URI
- `CORS_ORIGIN`:For connecting different cors
- `ACCESS_TOKEN_SECERET`: Secret key for JWT token generation
- `ACCESS_TOKEN_EXPIRY`:Access token expiary time
- `REFERESH_TOKEN_SECERET`:Secret key for refresh token generation
- `REFERESH_EXPIRY`:Refresh token expiary time
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret

## Contributors
- [NISHANT KAUSHAL](https://github.com/klnishant)

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
