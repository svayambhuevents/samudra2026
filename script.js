const API_URL = "https://script.google.com/macros/s/AKfycbw7phBMWubjsUUpwIwCqgc4eMOr8iZmTt4yLkqF2416Jo93C4tQoTq2LuFejWJlbba5/exec";

let formData = {};
let config = {};
const pageContainer = document.getElementById("page");
const loadingOverlay = document.getElementById("loadingOverlay");

window.onload = () => {
  document.getElementById("paymentBlock").style.display = "none";
  document.getElementById("confirmationBlock").style.display = "none";
};

function showLoader() {
  loadingOverlay.classList.remove("d-none");
  loadingOverlay.classList.add("show");
}

function hideLoader() {
    loadingOverlay.classList.remove("show");
    loadingOverlay.classList.add("d-none");
}

document.getElementById("validate_registration").addEventListener("click", async () => {
    showLoader();
    document.getElementById("paymentSection").style.display = "none";
    document.getElementById("noPaymentSection").style.display = "none";
    document.getElementById("qrSection").style.display = "none";
    document.getElementById("accountSection").style.display = "none";
    document.getElementById("uenSection").style.display = "none";
    document.querySelectorAll(".error").forEach(e => e.innerHTML = "");
    
    formData.action = "validateRegistration";
    formData.name = document.getElementById("full_name").value.trim();
    formData.email = document.getElementById("email").value.trim();
    formData.phone = document.getElementById("phone").value.trim();
    formData.timing = document.getElementById("timing").value;
    formData.ticket = document.getElementById("ticket").value;
    formData.paxNum = Number(document.getElementById("paxNum").value);
    formData.promo = document.getElementById("promo").value.trim();
    document.querySelectorAll(".error").forEach(e => e.innerHTML = "");

    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(result => {
        if (Object.keys(result.errors).length > 0) {
            for (let key in result.errors) {
                let el = document.getElementById("e_" + key);
                if (el) el.innerHTML = result.errors[key];
            }
            hideLoader();
        } else {
            formData.price = result.price;
            document.getElementById("noOfPax").textContent = formData.paxNum;
            document.getElementById("ticketPrice").textContent = "$" + formData.price.ticketPrice.toFixed(2);
            document.getElementById("totalPrice").textContent = "$" + formData.price.totalPrice.toFixed(2);
            document.getElementById("discountPrice").textContent = "$" + formData.price.discountPrice.toFixed(2);
            document.getElementById("finalPrice").textContent = "$" + formData.price.finalPrice.toFixed(2);
            document.getElementById("uploadFile").value = formData.file || "";
            document.getElementById("paymentSection").style.display = "none";
            document.getElementById("noPaymentSection").style.display = "none";
            document.getElementById("qrSection").style.display = "none";
            document.getElementById("accountSection").style.display = "none";
            document.getElementById("uenSection").style.display = "none";
            document.getElementById("contactNumber1").innerHTML = result.contactNumber;

            if (Number(formData.price.finalPrice) === 0) {
                document.getElementById("noPaymentSection").style.display = "block";
            } else {
                document.getElementById("paymentSection").style.display = "block";
            }
            
            if (formData.paymentMethod === 'PayLah/PayNow') {
                document.getElementById("paylah_paynow").checked = true;
            } else if (formData.paymentMethod === 'Account Transfer') {
                document.getElementById("account_transfer").checked = true;
            } else if (formData.paymentMethod === 'UEN') {
                document.getElementById("uen").checked = true;
            }

            changePaymentMethod();

            hideLoader();

            document.getElementById("registerationBlock").style.display = "none";
            document.getElementById("paymentBlock").style.display = "block";
        }
    })
    .catch(console.error);
});

function changePaymentMethod() {
    document.getElementById("qrSection").style.display = "none";
    document.getElementById("accountSection").style.display = "none";
    document.getElementById("uenSection").style.display = "none";
    formData.paymentMethod = 'No payment required';

    const method = document.querySelector('input[name="paymentMethod"]:checked')?.value;
    if (method === "PayLah/PayNow") {
        document.getElementById("qrSection").style.display = "block";
        formData.paymentMethod = 'PayLah/PayNow';
    } else if (method === "Account Transfer") {
        document.getElementById("accountSection").style.display = "block";
        formData.paymentMethod = 'Account Transfer';
    } else if (method === "UEN") {
        document.getElementById("uenSection").style.display = "block";
        formData.paymentMethod = 'UEN';
    }
}

function submitForm() {
    showLoader();
  
    let error = false;

    if (!document.getElementById("agree").checked) {
        e_agree.innerHTML = "Please read and agree to the disclaimer before submitting.";
        error = true;
    }

    let file = null;
    if (Number(formData.price.finalPrice) > 0) {
        const e_paymentMethod = document.getElementById("e_paymentMethod");
        const e_file = document.getElementById("e_file");

        e_paymentMethod.innerHTML = "";
        e_file.innerHTML = "";

        let method = document.querySelector('input[name="paymentMethod"]:checked')?.value;
        file = document.getElementById("uploadFile").files[0];

        if (!method) {
            e_paymentMethod.innerHTML = "Please select payment method";
            error = true;
        }
        if (!file) {
            e_file.innerHTML = "Please select a file.";
            error = true;
        }
        if (file.size > 1 * 1024 * 1024) {
            e_file.innerHTML = "Maximum file size is 10 MB.";
            error = true;
        }
    }

    if (error) {
        hideLoader();
        return;
    }

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            formData.file = e.target.result.split(",")[1];
            formData.filename = file.name;
            formData.mimeType = file.type;
            saveBooking();
        };
        reader.readAsDataURL(file);
    } else {
        formData.file = "";
        saveBooking();
    }
}

function saveBooking() {
    showLoader();
    formData.action = "saveRegistration";
    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(result => {
        document.getElementById("bookingId").innerHTML = result.bookingId;
        document.getElementById("contactNumber2").innerHTML = result.contactNumber;
        document.getElementById("paymentBlock").style.display = "none";
        document.getElementById("confirmationBlock").style.display = "block";
        hideLoader();
    })
    .catch(console.error);
}
