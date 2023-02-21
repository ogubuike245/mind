let courses = window.courses;
let usersByDate = window.usersByDate;

usersByDate.sort((a, b) => {
  return (
    new Date(a._id.year, a._id.month, a._id.day) -
    new Date(b._id.year, b._id.month, b._id.day)
  );
});

// Get data for each chart
const chartData = courses.map((course) => {
  const users = course.registeredUsers;
  const uploads = course.documents;

  const downloads = course.documents;

  // Get number of users registered per course
  const numUsersRegistered = users.length;

  // Get number of documents uploaded per course
  const numUploads = uploads.length;

  return {
    title: course.title,
    numUsersRegistered,
    numUploads,
  };
});

// Get chart container
const barChart = document.getElementById("bar");
const barChart2 = document.getElementById("bar2");
const lineChart = document.getElementById("line");
const usersChart = document.getElementById("users");

// Set background and border colors for charts
const bgColors = [
  "rgba(255, 99, 132, 0.6)",
  "rgba(54, 162, 235, 0.6)",
  "rgba(255, 206, 86, 0.6)",
  "rgba(75, 192, 192, 0.6)",
  "rgba(153, 102, 255, 0.6)",
  "rgba(255, 159, 64, 0.6)",
];
const borderColors = [
  "rgba(255, 99, 132, 0.8)",
  "rgba(54, 162, 235, 0.8)",
  "rgba(255, 206, 86, 0.8)",
  "rgba(75, 192, 192, 0.8)",
  "rgba(153, 102, 255, 0.8)",
  "rgba(255, 159, 64, 0.8)",
];

// Create bar chart
const barChartContext = barChart.getContext("2d");
const barChartLabels = chartData.map((data) => data.title);
const barChartData = chartData.map((data) => data.numUsersRegistered);

new Chart(barChartContext, {
  type: "bar",
  data: {
    labels: barChartLabels,
    datasets: [
      {
        label: "USERS REGISTERED PER COURSE",
        data: barChartData,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 3,
      },
    ],
  },
  options: {
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    },
  },
});

// Create bar chart2
const barChart2Context = barChart2.getContext("2d");
const barChart2Labels = chartData.map((data) => data.title);
const barChart2Data = chartData.map((data) => data.numUploads);

new Chart(barChart2Context, {
  type: "bar",
  data: {
    labels: barChart2Labels,
    datasets: [
      {
        label: "DOCUMENTS UPLOADED PER COURSE",
        data: barChart2Data,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 3,
      },
    ],
  },
  options: {
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    },
  },
});
// Create bar chart2
const lineChartContext = lineChart.getContext("2d");
const lineChartLabels = usersByDate.map(
  (data) => `${data._id.year}-${data._id.month}-${data._id.day}`
);
const lineChartData = usersByDate.map((data) => data.count);

new Chart(lineChartContext, {
  type: "line",
  data: {
    labels: lineChartLabels,
    datasets: [
      {
        label: "TOTAL NUMBER OF USERS REGISTERED PER DAY",
        data: lineChartData,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 3,
      },
    ],
  },
  options: {
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    },
  },
});
