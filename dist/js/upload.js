const form = document.getElementById("upload-form");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const formData = new FormData(form);
    const response = await fetch("/api/v1/course/upload", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    if (data.success) {
      showToastifyNotification(
        "success",
        "Document uploaded successfully.",
        data.redirect
      );
      form.reset();
    } else {
      console.log(data.error);
      showToastifyNotification("error", data.error);
    }
  } catch (error) {
    console.log(error);
    showToastifyNotification("error", error);
  }
});

function showToastifyNotification(type, message, redirectUrl = null) {
  Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "center",
    backgroundColor: type === "success" ? "#2ecc71" : "#e74c3c",
  }).showToast();

  if (type === "success" && redirectUrl) {
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 2000);
  }
}
