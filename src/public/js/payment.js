async function initiatePayment(orderDetails) {
  try {
    const response = await fetch("/api/payment/initiate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(orderDetails),
    });

    const result = await response.json();

    if (result.success) {
      // Create and submit form to CCAvenue
      const form = document.createElement("form");
      form.method = "POST";
      form.action = result.data.paymentUrl;

      const encRequestInput = document.createElement("input");
      encRequestInput.type = "hidden";
      encRequestInput.name = "encRequest";
      encRequestInput.value = result.data.params.encRequest;

      const accessCodeInput = document.createElement("input");
      accessCodeInput.type = "hidden";
      accessCodeInput.name = "access_code";
      accessCodeInput.value = result.data.params.access_code;

      form.appendChild(encRequestInput);
      form.appendChild(accessCodeInput);

      document.body.appendChild(form);
      form.submit();
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Payment initiation failed:", error);
    alert("Failed to initiate payment. Please try again.");
  }
}
