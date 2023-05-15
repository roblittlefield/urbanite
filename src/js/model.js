import * as sfapi from "./config.js";

const fetchApiPolice48h = async function () {
    try {
      const res = await fetch(`${API_URL_POLICE_48h}??`);
      // How to use token: json?$$app_token=APP_TOKEN
      if (!res.ok) {
          throw new Error("Network response for promise was not ok")
      }
      const dataPolice48h = await res.json();
    } catch (err) {
      console.log(err);
    }
  };