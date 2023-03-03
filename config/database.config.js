const mongoose = require("mongoose");

const { API_PORT, MONG0_DB_URI } = process.env;

const connectToDatabase = async (app) => {
  try {
    await mongoose.set("strictQuery", false).connect(MONG0_DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    app.listen(API_PORT || 9000, () => {
      console.log(` BACKEND SERVER RUNNING ON PORT : ${API_PORT}  AND CONNECTED TO MONGODB DATABASE`);
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectToDatabase;

//DATABASE CONNECTION AND SERVER INITIALISATION
