const createCourseForm = document.getElementById("createCourse-form");

createCourseForm.addEventListener("submit", handleFormSubmit);

async function handleFormSubmit(event) {
  event.preventDefault();
  try {
    const formData = new FormData(createCourseForm);
    const data = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    const response = await fetch("/api/v1/course/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();

    if (result.success) {
      showToastifyNotification("success", result.message, result.redirect);
      createCourseForm.reset();
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
    }, 1000);
  }
}
