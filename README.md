## Design Architecture
<img src="https://i.ibb.co/sCMRR6w/Untitled-2023-06-16-0227-1.png" alt="Untitled-2023-06-16-0227-1" border="0">

#### The Beras.AI cloud computing solution has developed an API to present content on mobile apps, specifically focusing on displaying rice prices and tengkulak information. The mobile application initiates a GET request to an API deployed on a Cloud Run container, which handles user requests and interacts with a Firestore database. Additionally, a web admin interface using React.js is deployed on a Cloud Run container to perform CRUD operations on the data stored in the Firestore database. This ensures a scalable and efficient solution for managing and manipulating data in the system.

## Secure Rest APIs
<img src="https://i.ibb.co/7JNZspp/jwt-capstone-1.png" alt="jwt-capstone-1" border="0">

#### The HTTP API requires access control for POST, PUT, and DELETE methods using JWT Authentication. To check the JWT token, the user must log in and the server will verify if the user's token is valid. If the token is not valid, the data creation process will be rejected, but if it is valid, the server will respond with an "OK" status.

## Tools 
* VSC 
* Backend : Express.js
* Frontend : React.Js
* Database : Firestore 
* Admin Authentication : Json web token 
* Postman : Test API

## Prerequisites
#### Before starting the API development process, ensure that you have the following prerequisites installed:
1. Visual Studio Code (VSC): Download and install the latest version of Visual Studio Code, a lightweight and versatile code editor.
2. Node.js and npm: Install Node.js, which includes npm (Node Package Manager), by downloading and running the installer from the official Node.js website.
3. Backend Tools : Express.js: Install Express.js, a popular backend framework for Node.js
4. Frontend Tools: React.js: Install React.js, a JavaScript library for building user interfaces
5. Database : Firestore: Set up a Firestore database by creating a project in the Google Cloud Console. Obtain the necessary credentials to authenticate your application with Firestore.
6. Admin Authentication: JSON Web Token (JWT): Install the necessary JWT libraries to handle authentication in your backend
7. Postman: Download and install Postman, a powerful API testing tool, from the official Postman website.

## Getting Started 
#### Follow these steps to get started with building the API:
1. Backend Setup : 
* Open Visual Studio Code and create a new folder for your backend project.
* Inside the project folder, initialize a new Node.js project 
* Create an index.js file and start building your Express.js backend API. Refer to the Express.js documentation for routing, handling requests, and integrating with Firestore.
* Implement JWT authentication for the necessary routes using the jsonwebtoken library. Verify the JWT token for user authentication and authorization.
* Connect your backend to the Firestore database using the necessary Firestore libraries and credentials.

2. Frontend Setup : 
* Open a new terminal in Visual Studio Code and navigate to the root folder of your frontend React.js project.
* Start the React development server
* Begin building your React.js frontend interface. Use the React.js documentation for handling components, state, and interactions with the backend API.

3. Database Setup : 
* In the Google Cloud Console, create a Firestore database and obtain the necessary credentials to connect your backend to Firestore. Follow the Firestore documentation for further guidance on managing data and integrating with your Express.js backend.

4. Admin Auth : 
* Implement the necessary logic in your Express.js backend to handle admin authentication using JWT. Generate and sign the JWT token upon successful login and verify it for protected routes.

5. API Testing with Postmant 
* Launch Postman and create a new request collection for testing your API endpoints.
* Add requests to test various routes, including GET, POST, PUT, and DELETE, along with the necessary headers and request bodies.
* Send requests and verify the responses from your API. Use the Postman documentation for advanced testing features and techniques.
