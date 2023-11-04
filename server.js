// Import required modules
const express = require("express");
const bcrypt = require("bcrypt");
const session = require("express-session");
const User = require("./connection"); // Import your User model
const app = express();
const transporter = require("./sendmail");

const port = process.env.PORT || 2000;

// Middleware for parsing form data and session management
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
// Configure sessions
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// Custom middleware to check authentication
const requireAuth = (req, res, next) => {
  if (req.session.user) {
    // If the user is authenticated, allow the request to continue
    next();
  } else {
    // If the user is not authenticated, redirect to the login page
    res.redirect("/login");
  }
};

app.get("/login", (req, res) => {
  const errorMessage = req.session.errorMessage;
  req.session.errorMessage = null;
  res.render("login", { errorMessage });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      // return res.status(401).send("Invalid email or password");
      req.session.errorMessage = "Invalid email";
      res.redirect("/login");
    } else {
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        req.session.user = user; // Create a session upon login
        res.redirect("/");
      } else {
        // res.status(401).send("Invalid email or password");
        req.session.errorMessage =
          "Incorrect password,Please enter correct password";
        res.redirect("/login");
      }
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send("Server error");
  }
  function clearSuggestions(inputElement) {
    inputElement.value = "";
  }
});

// Register route
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.render("register", {
        existingUser: true,
        errorMessage: "User already exists",
      });
      res.redirect("/login");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    req.session.user = newUser; // Create a session upon registration

    // Send a welcome email to the user
    const mailOptions = {
      from: "nodemaillerapp@gmail.com", // Sender's email address
      to: email, // User's email address
      subject: "Welcome to Our App",
      text: `Hi ${name},\n\nWelcome to our app! We're excited to have you on board.\n\nBest regards,\nYour App Team`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email error:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.redirect("/");
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).send("Server error");
  }

  function clearSuggestions(inputElement) {
    inputElement.value = "";
  }
});

// Main index page (protected)
app.get("/", requireAuth, (req, res) => {
  res.render("index", { userName: req.session.user.name });
});

// Logout route
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error:", err);
    }
    res.redirect("/login"); // Redirect to the login page after logging out
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
