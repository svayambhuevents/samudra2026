const API_URL = "https://script.google.com/macros/s/AKfycbw7phBMWubjsUUpwIwCqgc4eMOr8iZmTt4yLkqF2416Jo93C4tQoTq2LuFejWJlbba5/exec";

document.getElementById("getBtn").addEventListener("click", async () => {
  fetch(API_URL)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      document.getElementById("getResult").textContent =
        JSON.stringify(data, null, 2);
    })
    .catch(error => console.error(error));
});

document.getElementById("postBtn").addEventListener("click", async () => {
  const formData = new FormData();
  formData.append("name", "John");
  formData.append("age", "25");
  
  fetch(API_URL, {
    method: "POST",
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    console.log(data);
    document.getElementById("postResult").textContent =
      JSON.stringify(data, null, 2);
  })
  .catch(console.error);
});
