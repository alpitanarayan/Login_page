// Import required modules
const express = require("express");
const bcrypt = require("bcrypt");
const session = require("express-session");
const User = require("./connection"); // Import your User model
const app = express();
const transporter = require("./sendmail");

const port = process.env.PORT || 5000;

// Middleware for parsing form data and session management
app.use(express.json());
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

    const Email = process.env.Email;

    // Send a welcome email to the user
    const mailOptions = {
      from: Email, // Sender's email address
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

app.get("/views/weather.ejs", (req, res) => {
  res.render("weather");
});

app.post("/weather", async (req, res) => {
  const apiKey = process.env.apiKey;
  const apiUrl = process.env.apiUrl;

  // const searchBox = document.querySelector(".search input");
  // const searchBtn = document.querySelector(".search button");
  // const weatherIcon = document.querySelector(".weather-icon");

  const { city } = req.body;
  console.log("This is city name in server.js", city);
  try {
    const response = await fetch(`${apiUrl}${city}&appid=${apiKey}`);
    const data = await response.json();
    console.log(data);
    if (response.status === 404) {
      res.status(404).json({ error: "Invalid City Name" });
    } else {
      let weatherIcon = "";

      if (data.weather[0].main == "Clouds") {
        weatherIcon = "clouds.png";
      } else if (data.weather[0].main == "Clear") {
        weatherIcon = "clear.png";
      } else if (data.weather[0].main == "Rain") {
        weatherIcon = "rain.png";
      } else if (data.weather[0].main == "Drizzle") {
        weatherIcon = "drizzle.png";
      } else if (data.weather[0].main == "Mist") {
        weatherIcon = "mist.png";
      }else if (data.weather[0].main == "Haze") {
        weatherIcon = "haze.png";
      }
      const weatherData = {
        city: data.name,
        temp: Math.round(data.main.temp),
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        weatherMain: weatherIcon,
      };

      console.log(weatherData);

      res.json(weatherData);
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
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
  console.log(`Server is running on port: ${port}`);
});
