
const bcrypt = require("bcryptjs");

const password = "Akahat@1984";

bcrypt.hash(password, 12).then((hash) => {
  console.log("Bcrypt hash:");
  console.log(hash);
});
//    joborebit2003@gmail.com
//   Akahat@1984