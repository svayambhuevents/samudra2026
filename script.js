const API_URL = "https://script.google.com/macros/s/AKfycbw7phBMWubjsUUpwIwCqgc4eMOr8iZmTt4yLkqF2416Jo93C4tQoTq2LuFejWJlbba5/exec";

let formData = {};
let config = {};
const pageContainer = document.getElementById("page");
const loadingOverlay = document.getElementById("loadingOverlay");

window.onload = () => {
  console.log('Loading ...');
  document.getElementById("paymentPage").style.display = "none";
  console.log('Loaded!');
};

function showLoader() {
  loadingOverlay.classList.remove("d-none");
  loadingOverlay.classList.add("show");
}

function hideLoader() {
    loadingOverlay.classList.remove("show");
    loadingOverlay.classList.add("d-none");
}

function validateRegistration() {
    document.getElementById("registerPage").style.display = "none";
    document.getElementById("paymentPage").style.display = "block";
  
    showLoader();
    formData.name = full_name.value.trim();
    formData.email = email.value.trim();
    formData.phone = phone.value.trim();
    formData.timing = timing.value;
    formData.ticket = ticket.value;
    formData.pax = pax.value;
    formData.promo = promo.value.trim();
    document.querySelectorAll(".error").forEach(e => e.innerHTML = "");
    google.script.run
        .withSuccessHandler(function (result) {
            if (Object.keys(result.errors).length > 0) {
                for (let key in result.errors) {
                    let el =
                        document.getElementById("e_" + key);
                    if (el) {
                        el.innerHTML =
                            result.errors[key];
                    }
                }
                hideLoader();
            } else {
                formData.price = result.price;
                google.script.run
                  .withSuccessHandler(function (html) {
                    if (pageContainer) pageContainer.innerHTML = html;
                    document.getElementById("pax").textContent = formData.pax;
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

                    if (Number(formData.price.finalPrice) === 0) {
                        document.getElementById("noPaymentSection").style.display = "block";
                    } else {
                        document.getElementById("paymentSection").style.display = "block";
                    }
                    
                    let accountDetailsHtml = "";
                    config.accountDetails.forEach(function(line) {
                        accountDetailsHtml += line + "<br>";
                    });

                    let uenDetailsHtml = "";
                    config.uenDetails.forEach(function(line) {
                        uenDetailsHtml += line + "<br>";
                    });
                    
                    document.getElementById("qrImage").src = config.qrImage;
                    document.getElementById("accountSection").innerHTML = accountDetailsHtml;
                    document.getElementById("uenSection").innerHTML = uenDetailsHtml;

                    if (formData.paymentMethod === 'PayLah/PayNow') {
                      document.getElementById("paylah_paynow").checked = true;
                    }
                    if (formData.paymentMethod === 'Account Transfer') {
                      document.getElementById("account_transfer").checked = true;
                    }
                    if (formData.paymentMethod === 'UEN') {
                      document.getElementById("uen").checked = true;
                    }

                    changePaymentMethod();

                    hideLoader();
                  })
                  .withFailureHandler(function (error) {
                    hideLoader();
                    console.log(error);
                    alert("Unable to load payment page");
                  })
                  .includePage("Payment");
            }
        })
        .withFailureHandler(function (error) {
            hideLoader();
            console.log(error);
            alert("Unable to validate registration");
        })
        .validateRegistration(formData);
}

function changePaymentMethod() {
    document.getElementById("qrSection").style.display = "none";
    document.getElementById("accountSection").style.display = "none";
    document.getElementById("uenSection").style.display = "none";
    formData.paymentMethod = 'No payment required';

    const method = document.querySelector('input[name="paymentMethod"]:checked')?.value;
    if (method === "PayLah/PayNow") {
        document.getElementById("qrSection").style.display = "block";
        formData.paymentMethod = 'PayLah/PayNow';
    }
    if (method === "Account Transfer") {
        document.getElementById("accountSection").style.display = "block";
        formData.paymentMethod = 'Account Transfer';
    }
    if (method === "UEN") {
        document.getElementById("uenSection").style.display = "block";
        formData.paymentMethod = 'UEN';
    }
}

function submitForm() {
    let file = null;
    if (Number(formData.price.finalPrice) > 0) {
        const e_paymentMethod = document.getElementById("e_paymentMethod");
        const e_file = document.getElementById("e_file");

        e_paymentMethod.innerHTML = "";
        e_file.innerHTML = "";

        let error = false;
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
        if (file.size > 10 * 1024 * 1024) {
            e_file.innerHTML = "Maximum file size is 10 MB.";
            error = true;
        }

        if (error) {
            return;
        }
    }

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            formData.file = e.target.result;
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
    google.script.run
        .withSuccessHandler(function (result) {
            document.getElementById("page").innerHTML =
                `
<div class="card bg-success-subtle border-success-subtle">
<h5 class="text-center text-success-emphasis fw-bold">Registration Successful!</h5>
<div class="card-body">
<h5 class="card-title text-success-emphasis">Booking ID: ${result.bookingId}</h5>
<p class="card-text text-success-emphasis">
  Please be informed that a confirmation email containing your tickets will be sent after your payment has been verified.
  <br/>
  <br/>
  <b>Can't find the email?</b>
  <br/>
  Please check Spam, Junk, or Promotions folder.<br/>
  If you have not received the confirmation email within 24 hours, please contact the organizer at ${result.contactNumber} for assistance.
</div>
`;
            hideLoader();
        })
        .saveRegistration(formData);
}
