const registerForm = document.getElementById("register-form");

registerForm.addEventListener("submit", handleFormSubmit);

async function handleFormSubmit(event) {
  event.preventDefault();
  try {
    const formData = new FormData(registerForm);
    const data = {};
    for (const [key, value] of formData.entries()) {
      if (key === "selectedCourses") {
        // If the key is 'selectedCourses', create an array with the value(s)
        // and append it to the 'data' object
        if (!data[key]) {
          data[key] = [];
        }
        data[key].push(value);
      } else {
        // For other keys, directly append the value to the 'data' object
        data[key] = value;
      }
    }
    const response = await fetch("/api/v1/user/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();

    if (result.success) {
      showToastifyNotification("success", result.message, result.redirect);
      registerForm.reset();
    } else if (result.error) {
      showToastifyNotification("error", result.message);
    }
  } catch (error) {
    console.log(error);
    showToastifyNotification("error", error);
  }
}

function showToastifyNotification(type, message, redirectUrl = null) {
  Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "center",
    style: {
      background: type === "success" ? "#2ecc71" : "#e74c3c",
    },
  }).showToast();

  if (type === "success" && redirectUrl) {
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 500);
  }
}
