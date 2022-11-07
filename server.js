const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const { runPythonShell } = require("./pythonShell");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use(express.static(path.join(__dirname, "client/build")));

app.post("/api", ({ body }, res) => {
  let options = {
    args: [
      body.EZ,
      body.BT,
      body.GT,
      body.WLF,
      body.BS_HZ_Norm,
      body.BS_KL_Norm,
      body.BS_HZ,
      body.BS_KL,
      body.P_HZ,
      body.P_KL,
      body.FF,
      body.boreDepth,
      body.points,
    ],
  };
  if (options.args.every((option) => option !== undefined)) {
    runPythonShell(res, options);
  } else {
    res.status(500).send({
      error: "Sie haben einen ungültigen Query-String eingegeben.",
    });
  }
});

app.get("*", (_, res) => {
  res.sendFile(path.resolve(__dirname, "client/build/index.html"));
});

app.listen(process.env.PORT || port);
