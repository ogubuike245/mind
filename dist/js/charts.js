let courses = window.courses;
const title = courses.map((course) => course.title);
const displayDocumentsUploadedPerCourseLength = courses.map(
  (course) => course.documents.length
);
const displayRegisteredUsersLength = courses.map(
  (course) => course.registeredUsers.length
);
const displayDownloadedDocumentLength = courses.map(
  (course) => course.registeredUsers.length
);

const barBgColors = [
  "rgba(255, 99, 132, 0.6)",
  "rgba(54, 162, 235, 0.6)",
  "rgba(255, 206, 86, 0.6)",
  "rgba(75, 192, 192, 0.6)",
  "rgba(153, 102, 255, 0.6)",
  "rgba(255, 159, 64, 0.6)",
];
const barBorderColors = [
  "rgba(255, 99, 132, 0.8)",
  "rgba(54, 162, 235, 0.8)",
  "rgba(255, 206, 86, 0.8)",
  "rgba(75, 192, 192, 0.8)",
  "rgba(153, 102, 255, 0.8)",
  "rgba(255, 159, 64, 0.8)",
];

const boardOne = document.getElementById("pie").getContext("2d");

const chartOne = new Chart(boardOne, {
  type: "bar",
  data: {
    labels: title,
    datasets: [
      {
        label: "DOCUMENTS UPLOADED PER COURSE",
        data: displayDocumentsUploadedPerCourseLength,
        backgroundColor: barBgColors,
        borderColor: barBorderColors,
        borderWidth: 3,
      },
    ],
  },
  options: {
    scales: {
      yAxes: [
        {
          ticks: {
            callback: function (value) {
              if (Number.isInteger(value)) {
                return value;
              }
            },
          },
        },
      ],
    },
  },
});

const boardTwo = document.getElementById("bar").getContext("2d");

const chartTwo = new Chart(boardTwo, {
  type: "bar",
  data: {
    labels: title,
    datasets: [
      {
        label: "REGISTERED USERS PER COURSE",
        data: displayRegisteredUsersLength,
        backgroundColor: barBgColors,
        borderColor: barBorderColors,
        borderWidth: 3,
      },
    ],
  },
  options: {
    scales: {
      yAxes: [
        {
          ticks: {
            callback: function (value) {
              if (Number.isInteger(value)) {
                return value;
              }
            },
          },
        },
      ],
    },
  },
});
const boardThree = document.getElementById("line").getContext("2d");

const chartThree = new Chart(boardThree, {
  type: "line",
  data: {
    labels: title,
    datasets: [
      {
        label: "DOWNLOADED DOCUMENTS  PER COURSE",
        data: displayDownloadedDocumentLength,
        backgroundColor: barBgColors,
        borderColor: barBorderColors,
        borderWidth: 3,
      },
    ],
  },
  options: {
    scales: {
      yAxes: [
        {
          ticks: {
            callback: function (value) {
              if (Number.isInteger(value)) {
                return value;
              }
            },
          },
        },
      ],
    },
  },
});
