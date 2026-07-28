const API_URL = "https://script.google.com/macros/s/AKfycbw7phBMWubjsUUpwIwCqgc4eMOr8iZmTt4yLkqF2416Jo93C4tQoTq2LuFejWJlbba5/exec";

// document.getElementById("loadBtn").addEventListener("click", async () => {
//   try {
//     const response = await fetch(API_URL);

//     if (!response.ok) {
//       throw new Error(`HTTP ${response.status}`);
//     }

//     const data = await response.json();

//     document.getElementById("result").textContent =
//       JSON.stringify(data, null, 2);

//   } catch (err) {
//     console.error(err);
//   }
// });

document.getElementById("getBtn").addEventListener("click", async () => {
  fetch(API_URL)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      document.getElementById("result").textContent =
        JSON.stringify(data, null, 2);
    })
    .catch(error => console.error(error));
}

document.getElementById("postBtn").addEventListener("click", async () => {
  const payload = {
    name: "John",
    age: 25
  };
  
  fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
  .then(response => response.json())
  .then(data => {
    console.log(data);
  })
  .catch(error => console.error(error));
});
