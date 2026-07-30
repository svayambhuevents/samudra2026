(() => {
    let formData = {};
    let contactNumber = "";

    const getElement = (id) => document.getElementById(id);

    const loadingOverlay = getElement("loadingOverlay");

    const setText = (id, value) => {
        const element = getElement(id);
        if (element) {
            element.textContent = value;
        }
    };
    const setHtml = (id, value) => {
        const element = getElement(id);
        if (element) {
            element.innerHTML = value;
        }
    };
    const setStyle = (id, value) => {
        const element = getElement(id);
        if (element) {
            element.style.display = value;
        }
    };
    const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;
    const buildDetailsHtml = (lines = []) => lines.join("<br>");

    const url = `https://script.google.com/macros/s/AKfycbw7phBMWubjsUUpwIwCqgc4eMOr8iZmTt4yLkqF2416Jo93C4tQoTq2LuFejWJlbba5/exec`;

    function showLoader() {
        if (!loadingOverlay) return;
        loadingOverlay.classList.remove("d-none");
        loadingOverlay.classList.add("show");
    }

    function hideLoader() {
        if (!loadingOverlay) return;
        loadingOverlay.classList.remove("show");
        loadingOverlay.classList.add("d-none");
    }

    function populateRegistrationFields() {
        const registrationFields = {
            full_name: formData.name || "",
            email: formData.email || "",
            phone: formData.phone || "",
            timing: formData.timing || "",
            ticket: formData.ticket || "",
            pax: formData.pax || "",
            promo: formData.promo || ""
        };

        Object.entries(registrationFields).forEach(([id, value]) => {
            const element = getElement(id);
            if (element) {
                element.value = value;
            }
        });
    }

    async function validateRegistration() {
        try {
            showLoader();

            document.querySelectorAll(".error").forEach((element) => {
                element.innerHTML = "";
            });

            formData = {
                ...formData,
                action: "validateRegistration",
                name: getElement("full_name")?.value.trim() || "",
                email: getElement("email")?.value.trim() || "",
                phone: getElement("phone")?.value.trim() || "",
                timing: getElement("timing")?.value || "",
                ticket: getElement("ticket")?.value || "",
                pax: getElement("pax")?.value || "",
                promo: getElement("promo")?.value.trim() || ""
            };
        
            const response = await fetch(url, {
                method: "POST",
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            
            if (result.errors !== undefined) {
                Object.entries(result.errors).forEach(([key, value]) => {
                    setHtml("e_" + key, value);
                });
                hideLoader();
                return;
            }
            formData.price = result.price;

            ["paymentSection", "noPaymentSection", "qrSection", "accountSection", "uenSection"].forEach((i) => {
                setStyle(i, "none");
            });

            setText("noOfPax", formData.pax);
            setText("ticketPrice", "$" + formatCurrency(formData.price.ticketPrice));
            setText("totalPrice", "$" + formatCurrency(formData.price.totalPrice));
            setText("discountPrice", "$" + formatCurrency(formData.price.discountPrice));
            setText("finalPrice", "$" + formatCurrency(formData.price.finalPrice));
            getElement("uploadFile").value = formData.file || "";

            const uploadFile = getElement("uploadFile");
            if (uploadFile) {
                uploadFile.value = formData.file || "";
            }

            if (Number(formData.price.finalPrice) === 0) {
                setStyle("noPaymentSection", "block");
            } else {
                setStyle("paymentSection", "block");
            }

            const paymentRadios = {
                "PayLah/PayNow": getElement("paylah_paynow"),
                "Account Transfer": getElement("account_transfer"),
                UEN: getElement("uen")
            };

            Object.entries(paymentRadios).forEach(([method, element]) => {
                if (element) {
                    element.checked = formData.paymentMethod === method;
                }
            });

            await changePaymentMethod();

            setStyle("registerationBlock", "none");
            setStyle("paymentBlock", "block");

            hideLoader();
        } catch (err) {
           console.error(err);
        }
    }

    async function changePaymentMethod() {
        ["qrSection", "accountSection", "uenSection"].forEach((i) => {
            setStyle(i, "none");
        });

        formData.paymentMethod = "No payment required";
        const method = document.querySelector('input[name="paymentMethod"]:checked')?.value;

        if (method === "PayLah/PayNow") {
            setStyle("qrSection", "block");
            formData.paymentMethod = "PayLah/PayNow";
        } else if (method === "Account Transfer") {
            setStyle("accountSection", "block");
            formData.paymentMethod = "Account Transfer";
        } else if (method === "UEN") {
            setStyle("uenSection", "block");
            formData.paymentMethod = "UEN";
        }

    }

    async function submitForm() {
        try {
            showLoader();
    
            document.querySelectorAll(".error").forEach((element) => {
                element.innerHTML = "";
            });

            let error = false;

            if (!getElement("agree").checked) {
                setText("e_agree", "Please read and agree to the disclaimer before submitting.");
                error = true;
            }

            let file = null;
            if (Number(formData.price?.finalPrice || 0) > 0) {
                setHtml("e_paymentMethod", "");
                setHtml("e_file", "");

                const method = document.querySelector('input[name="paymentMethod"]:checked')?.value;
                file = getElement("uploadFile")?.files[0] || null;

                if (!method) {
                    setHtml("e_paymentMethod", "Please select payment method");
                    error = true;
                }
                if (!file) {
                    setHtml("e_file", "Please select a file.");
                    error = true;
                }
                if (file && file.size > 10 * 1024 * 1024) {
                    setHtml("e_file", "Maximum file size is 10 MB.");
                    error = true;
                }
            }

            if (error) {
                hideLoader();
                return;
            }

            setStyle("paymentBlock", "none");

            formData.file = "";
            if (file) {
                const reader = new FileReader();
                reader.onload = async function (event) {
                    formData.file = event.target.result;
                    formData.filename = file.name;
                    formData.mimeType = file.type;
                    await saveBooking();
                };
                reader.readAsDataURL(file);
            } else {
                await saveBooking();
            }
            hideLoader();
        } catch (err) {
            console.error(err);
            hideLoader();
        }
    }

    async function saveBooking() {
        showLoader();
        formData = {
            ...formData,
            action: "saveRegistration"
        };

        const response = await fetch(url, {
            method: "POST",
            body: JSON.stringify(formData)
        });
        const result = await response.json();

        if (result.errors !== undefined) {
            let html = '<ul style="color:red">';
            Object.values(result.errors).forEach((message) => {
                html += `<li>${message}</li>`;
            });
            html += "</ul>";
            setStyle("failureBlock", "block");
            setHtml("failureMessage", html);
        } else {
            setHtml("bookingId", result.bookingId);
            setStyle("confirmationBlock", "block");
        }
        hideLoader();
    }

    async function loadConfig() {
        try {
            showLoader();
            const response = await fetch(url, {
                method: "POST",
                body: JSON.stringify({action: "getConfig"})
            });
            const result = await response.json();

            setHtml("eventName", result.eventDetails.name);
            setHtml("eventDate", result.eventDetails.date);
            setHtml("eventVenue", result.eventDetails.venue);

            document.querySelector('option[value="standard"]').textContent = "Standard - $" + result.ticketPrices.standard + " per ticket";
            document.querySelector('option[value="vip"]').textContent = "VIP - $" + result.ticketPrices.vip + " per ticket";

            getElement("eventBanner").src = result.banner;
            getElement("eventLogo").src = result.logo;
            getElement("qrImage").src = result.qrImage;

            setHtml("accountSection", buildDetailsHtml(result.accountDetails || []));
            setHtml("uenSection", buildDetailsHtml(result.uenDetails || []));

            document.querySelectorAll(".contactNumber").forEach(element => {
                element.textContent = result.contactNumber;
            });


            hideLoader();
        } catch (err) {
           console.error(err);
           hideLoader();
        }

    }

    window.onload = async () => {
        ["paymentBlock", "confirmationBlock", "failureBlock"].forEach((i) => {
            setStyle(i, "none");
        });
        await loadConfig();
    };

    window.validateRegistration = validateRegistration;
    window.changePaymentMethod = changePaymentMethod;
    window.submitForm = submitForm;

})();
