const { PythonShell } = require('python-shell');

const scriptFile = './python/BHEseppy_query_V50_MWP_beta6.py';

const runPythonShell = (res, options) => {
  PythonShell.run(scriptFile, options, function (err, results) {
    if (err) {
      throw new Error('Berechnung fehlgeschlagen!', { cause: err });
    }
    let resultList = [];
    if (results && results.length > 0) {
      let resultString = results[results.length - 1];
      resultList = resultString
        .replace(/[\[\]]/g, '')
        .split(',')
        .map((entry) => entry.trim().replaceAll("'", ''));
    }
    res.json(resultList);
  });
};

module.exports = { runPythonShell };
