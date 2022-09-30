const express = require("express");
const cors = require("cors");

const path = require("path");
const fs = require("fs");

const { runPythonShell } = require("./pythonShell");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.static(path.join(__dirname, "client/build")));

app.get("/api", ({ query }, res) => {
  let options = {
    args: [
      query.EZ,
      query.BT,
      query.GT,
      query.WLF,
      query.BS_HZ_Norm,
      query.BS_KL_Norm,
      query.BS_HZ,
      query.BS_KL,
      query.P_HZ,
      query.P_KL,
      query.FF,
      query.bohrtiefe,
      query.points,
    ],
  };
  runPythonShell(res, options);
});

app.get("*", (_, res) => {
  res.sendFile(path.resolve(__dirname, "client/build/index.html"));
});

app.listen(process.env.PORT || port);
