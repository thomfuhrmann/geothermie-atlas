const express = require("express");
const cors = require("cors");

const path = require("path");
const fs = require("fs");

const { runPythonShell } = require("./pythonShell");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.static(path.join(__dirname, "client/build")));

app.get("/api", function ({ query }, res) {
  let options = {
    args: [
      query.EZ,
      query.BT,
      query.GT,
      query.WLF,
      query.BS_HZ_Norm,
      query.BS_KL_Norm,
      "0",
      "0",
      "0",
      "0",
      query.FF,
    ],
  };
  runPythonShell(res, options);
});

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "client/build/index.html"));
});

app.listen(process.env.PORT || port);
