const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const e = require("express");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;

const app = express();

app.use(express.json());

app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  })
);

app.use("/customer/auth/*", function auth(req, res, next) {
  //Early return if no session
  if (!req.session.authorization) {
    return res.status(401).json({ message: "User not logged in" }); // status code 401 is more appropriate
  } else {
    const token = req.session.authorization["accessToken"];
    jwt.verify(token, "access", (err, user) => {
      if (err) {
        return res.status(401).json({ message: "Unauthorized" }); // status code 401 is more appropriate
      }
      req.user = user;
      next();
    });
  }
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
