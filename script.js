const button = document.getElementById("btn");
const message = document.getElementById("message");

button.addEventListener("click", () => {
    message.textContent = "Hello from JavaScript! 🎉";
});


const API_URL = "https://script.google.com/macros/s/AKfycbw7phBMWubjsUUpwIwCqgc4eMOr8iZmTt4yLkqF2416Jo93C4tQoTq2LuFejWJlbba5/exec";

document.getElementById("loadBtn").addEventListener("click", async () => {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    document.getElementById("result").textContent =
      JSON.stringify(data, null, 2);

  } catch (err) {
    console.error(err);
  }
});

// fetch(url)
//   .then(response => response.json())
//   .then(data => {
//     console.log(data);
//     document.getElementById("result").textContent =
//       JSON.stringify(data, null, 2);
//   })
//   .catch(error => console.error(error));

// const url = "https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxxx/exec";

// const payload = {
//   name: "John",
//   age: 25
// };

// fetch(url, {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json"
//   },
//   body: JSON.stringify(payload)
// })
// .then(response => response.json())
// .then(data => {
//   console.log(data);
// })
.catch(error => console.error(error));
