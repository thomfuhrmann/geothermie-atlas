const { PythonShell } = require("python-shell");

const fs = require("fs");
const path = require("path");

const scriptFile = "./python/BHEseppy_query_V50_GTHAtlas_beta2.py";

const runPythonShell = (res, options) => {
  PythonShell.run(scriptFile, options, function (err, results) {
    if (err) console.log(err);
    let resultList = [];
    if (results && results.length > 0) {
      let resultString = results[results.length - 1];
      resultList = resultString
        .replace(/[\[\]]/g, "")
        .split(",")
        .map((entry) => entry.trim().replaceAll("'", ""));
    }
    res.json(resultList);
  });
};

module.exports = { runPythonShell };
