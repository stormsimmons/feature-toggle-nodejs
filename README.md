# Feature Toggle Node.js

Dev and ops teams use feature flags to deploy code when they want and keep new features hidden until product and marketing teams are ready to share. 

## Getting Started

### Docker from GitHub

Step 1:

`git clone https://github.com/xyzblocks/feature-toggle-nodejs.git`

Step 2:

`cd feature-toggle-nodejs`

Step 3:

`docker build --no-cache -t feature-toggle-nodejs.`

Step 4:

`docker run -d --name feature-toggle-nodejs -p 8080:8080 feature-toggle-nodejs`

Step 5:

Browse to `http://localhost:8080/swagger`

IMPORTANT NOTE:

`sudo ufw allow 8080`