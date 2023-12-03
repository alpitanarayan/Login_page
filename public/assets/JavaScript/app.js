function getWeather() {
    const searchBox = document.querySelector(".search input");
    const city = searchBox.value;
  console.log(city);
  
    fetch("/weather", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ city }),
    })
      .then(response => response.json())
      .then(data => {
        const errorContainer = document.querySelector(".error");
        const weatherContainer = document.querySelector(".weather");
  
        if (data.error) {
          console.error(data.error);
          errorContainer.style.display = "block";
          weatherContainer.style.display = "none";
        } else {
          document.querySelector(".city").innerHTML = data.city;
          document.querySelector(".temp").innerHTML = `${data.temp}°C`;
          document.querySelector(".humidity").innerHTML = `${data.humidity}%`;
          document.querySelector(".wind").innerHTML = `${data.windSpeed} km/h`;
  
          const weatherIcon = document.querySelector(".weather-icon");
          weatherIcon.src = `../assets/images/${data.weatherMain}`;
  
          weatherContainer.style.display = "block";
          errorContainer.style.display = "none";
        }
      })
      .catch(error => {
        console.error("Weather request error:", error);
      });
  }
  