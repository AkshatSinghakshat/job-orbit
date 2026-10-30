/*
INTEGRATION NOTE:
If your project defines models in src/models/index.js, register TrainingCourse there using
the SAME sequelize instance and DataTypes used by existing models. Example:

const TrainingCourseFactory = require("./TrainingCourse");
const TrainingCourse = TrainingCourseFactory(sequelize, Sequelize.DataTypes);
db.TrainingCourse = TrainingCourse;

Then make sure src/models/index.js exports db (or its model object) so
require("../models") in trainingRoutes.js receives { TrainingCourse, TrainingInstitute, ... }.

Do not blindly replace your existing models/index.js. Merge the registration into it.
Also ensure server.js mounts:
app.use("/api/training", require("./src/routes/trainingRoutes"));
and your database sync/migration runs after model registration.
*/
