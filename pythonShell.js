const { PythonShell } = require("python-shell");

const scriptFile = "./python/BHEseppy_query_V41.py";

const runPythonShell = (res, options) => {
  PythonShell.run(scriptFile, options, function (err, results) {
    if (err) console.log(err);
    let resultList;
    if (results && results.length > 0) {
      let resultString = results[results.length - 1];
      resultList = resultString
        .substring(1, resultString.length - 1)
        .split(",")
        .map((entry) => entry.trim().replaceAll("'", ""));
    }
    res.json(resultList);
  });
};

module.exports = { runPythonShell };
