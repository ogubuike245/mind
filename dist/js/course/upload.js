const uploadForm = document.getElementById("upload-form");

uploadForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const formData = new FormData(uploadForm);
    const response = await fetch("/api/v1/course/upload", {
      method: "POST",
      body: formData,
    });
    const responseData = await response.json();
    if (responseData.success) {
      showNotification(
        "success",
        responseData.message,
        responseData.redirectUrl
      );
      uploadForm.reset();
    } else {
      console.log(responseData.error);
      showNotification("error", responseData.error);
    }
  } catch (error) {
    console.log(error);
    showNotification("error", error);
  }
});

function showNotification(type, message, redirectUrl = null) {
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
    }, 500);
  }
}
