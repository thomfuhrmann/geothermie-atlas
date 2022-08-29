const { PythonShell } = require("python-shell");

const scriptFile = "./python/BHEseppy_query_V41.py";

const runPythonShell = (res, options) => {
  PythonShell.run(scriptFile, options, function (err, results) {
    if (err) console.log(err);
    let resultString = results[results.length - 1];
    let resultList = resultString
      .substring(1, resultString.length - 1)
      .split(",");
    res.json(resultList);
  });
};

module.exports = { runPythonShell };
