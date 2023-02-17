let courses = window.courses;
const title = courses.map((course) => course.title);
const display = courses.map((course) => course.documents.length);
// let data = courses.map((course) => course.registeredUsers.length);

const boardTwo = document.getElementById("bar").getContext("2d");

const barChart = new Chart(boardTwo, {
  type: "bar",
  data: {
    labels: title,
    datasets: [
      {
        label: "USERS PER COURSE",
        data: display,
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(255, 159, 64, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 3,
      },
    ],
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
});
