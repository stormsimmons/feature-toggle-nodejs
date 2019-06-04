# Feature Toggle Node.js

Dev and ops teams use feature flags to deploy code when they want and keep new features hidden until product and marketing teams are ready to share. 

## Getting Started

`docker run -d --name feature-toggle-nodejs -p 8080:8080 xyzblocks/feature-toggle-nodejs`

Browse to `http://localhost:8080/swagger`

## Configuration

### Environment Variables

* `AUDIENCE` - Open ID Configuration Audience.
* `AUTHORITY` - Open ID Configuration Authority.
* `CONNECTION_STRING` - Connection String for MongoDB. (default: `mongodb://localhost:27017`)
* `HOST` Host for Server. (default: `localhost`)
* `PORT` - Port for Server. (default: `8080`)
