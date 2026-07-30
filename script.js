(() => {
    const state = {
        formData: {},
        config: {}
    };

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
            full_name: state.formData.name || "",
            email: state.formData.email || "",
            phone: state.formData.phone || "",
            timing: state.formData.timing || "",
            ticket: state.formData.ticket || "",
            pax: state.formData.pax || "",
            promo: state.formData.promo || ""
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
            state.formData = {
                ...state.formData,
                action: "validateRegistration",
                name: getElement("full_name")?.value.trim() || "",
                email: getElement("email")?.value.trim() || "",
                phone: getElement("phone")?.value.trim() || "",
                timing: getElement("timing")?.value || "",
                ticket: getElement("ticket")?.value || "",
                paxNum: getElement("paxNum")?.value || "",
                promo: getElement("promo")?.value.trim() || ""
            };
        
            document.querySelectorAll(".error").forEach((element) => {
                element.innerHTML = "";
            });

            console.log(state.formData);
            const response = await fetch(url, {
                method: "POST",
                body: JSON.stringify(state.formData)
            });
            const result = await response.json();
            console.log(result);
            
            if (result.errors !== undefined) {
                Object.entries(result.errors).forEach(([key, value]) => {
                    setHtml("e_" + key, value);
                });
                hideLoader();
                return;
            }
            state.formData.price = result.price;

            ["paymentSection", "noPaymentSection", "qrSection", "accountSection", "uenSection"].forEach((i) => {
                setStyle(i, "none");
            });

            setText("noOfPax", state.formData.paxNum);
            setText("ticketPrice", "$" + state.formData.price.ticketPrice.toFixed(2));
            setText("totalPrice", "$" + state.formData.price.totalPrice.toFixed(2));
            setText("discountPrice", "$" + state.formData.price.discountPrice.toFixed(2));
            setText("finalPrice", "$" + state.formData.price.finalPrice.toFixed(2));
            getElement("uploadFile").value = state.formData.file || "";
            setHtml("contactNumber1", result.contactNumber);

            const uploadFile = getElement("uploadFile");
            if (uploadFile) {
                uploadFile.value = state.formData.file || "";
            }

            if (Number(state.formData.price.finalPrice) === 0) {
                setStyle("noPaymentSection", "block");
            } else {
                setStyle("paymentSection", "block");
            }

            setHtml("accountSection", buildDetailsHtml(state.config.accountDetails || []));
            setHtml("uenSection", buildDetailsHtml(state.config.uenDetails || []));

            const qrImage = getElement("qrImage");
            if (qrImage) {
                qrImage.src = state.config.qrImage || "";
            }

            const paymentRadios = {
                "PayLah/PayNow": getElement("paylah_paynow"),
                "Account Transfer": getElement("account_transfer"),
                UEN: getElement("uen")
            };

            Object.entries(paymentRadios).forEach(([method, element]) => {
                if (element) {
                    element.checked = state.formData.paymentMethod === method;
                }
            });

            setHtml(
                "disclaimer",
                `Please do not attempt to rebook in the event of any booking issues.<br/> Instead, contact the organizer at ${state.config.contactNumber || "the organizer"} for assistance.`
            );

            changePaymentMethod();

            setStyle("registerationBlock", "none");
            setStyle("paymentBlock", "block");

            hideLoader();
        } catch (err) {
           console.error(err);
        }
    }

    getElement("nextButton").addEventListener("click", validateRegistration);

    function changePaymentMethod() {
        ["qrSection", "accountSection", "uenSection"].forEach((i) => {
            setStyle(i, "none");
        });

        state.formData.paymentMethod = "No payment required";
        const method = document.querySelector('input[name="paymentMethod"]:checked')?.value;

        if (method === "PayLah/PayNow") {
            setStyle("qrSection", "block");
            state.formData.paymentMethod = "PayLah/PayNow";
        } else if (method === "Account Transfer") {
            setStyle("accountSection", "block");
            state.formData.paymentMethod = "Account Transfer";
        } else if (method === "UEN") {
            setStyle("uenSection", "block");
            state.formData.paymentMethod = "UEN";
        }
    }

    async function submitForm() {
        try {
            showLoader();
    
            let error = false;

            if (!getElement("agree").checked) {
                setText("e_agree", "Please read and agree to the disclaimer before submitting.");
                error = true;
            }

            let file = null;
            if (Number(state.formData.price?.finalPrice || 0) > 0) {
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

            if (error) return;

            setStyle("paymentBlock", "none");

            state.formData.file = "";
            if (file) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    state.formData.file = event.target.result;
                    state.formData.filename = file.name;
                    state.formData.mimeType = file.type;
                };
                reader.readAsDataURL(file);
            }

            state.formData = {
                ...state.formData,
                action: "saveRegistration"
            }

            console.log(state.formData);
            const response = await fetch(url, {
                method: "POST",
                body: JSON.stringify(state.formData)
            });
            const result = await response.json();
            console.log(result);

            if (result.errors !== undefined) {
                let html = '<ul style="color:red">';
                Object.values(result.errors).forEach((message) => {
                    html += `<li>${message}</li>`;
                });
                html += "</ul>";
                setHtml("contactNumber2", result.contactNumber);
                setStyle("failureBlock", "block");
                setHtml("failureMessage", html);
            } else {
                setStyle("paymentBlock", "none")
                setHtml("bookingId", result.bookingId);
                setHtml("contactNumber3", result.contactNumber);
                setStyle("confirmationBlock", "block");
            }
            hideLoader();
        } catch (err) {
           console.error(err);
            hideLoader();
        }
    }

    getElement("submitButton").addEventListener("click", submitForm);

    window.onload = function () {
        showLoader();
        ["paymentBlock", "confirmationBlock", "failureBlock"].forEach((i) => {
            setStyle(i, "none");
        });
        hideLoader();
    };
})();
