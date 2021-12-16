const express = require('express');
const path = require("path");
const axios = require('axios');

const app = express();

app.get('/getTheirDssp', async (req, res) => {
  console.log('GET', req.query);
  res.set('Content-Type', 'text/html');
  const theirDssp = await getTheirDssp(req.query.pdbId);
  res.send(theirDssp);
});

app.use(express.static(path.join(__dirname, 'front', 'build')));

app.use('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'front', 'build', 'index.html'));
});

app.listen(process.env.PORT || 80);
console.log('STARTED at ' + (process.env.PORT || 80));

// const parsed = dssp.split('\n').slice(28).map((row, i) => {
//   return i + ' ' + (row.substr(16,1) === 'H' ? 'H' : ' ');
// });
//
// console.log(parsed.join('\n'));

async function getTheirDssp(pdbId) {
  const jobId = await createDsspJob(pdbId);

  console.log('jobId: ' + jobId);

  let status = await getStatusOfJob(jobId);

  while (status !== "SUCCESS") {
    console.log('status ',status)
    status = getStatusOfJob(jobId);
  }

  return getResultOfJob(jobId);

  async function createDsspJob(pdbId) {
    const createDsspUrl = `https://www3.cmbi.umcn.nl/xssp/api/create/pdb_id/dssp/`;
    const response = await axios({
      method: "post",
      url: createDsspUrl,
      data: formUrlEncoded({data: pdbId}),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response.data.id;
  }

  async function getStatusOfJob(jobId) {
    const statusUrl = `https://www3.cmbi.umcn.nl/xssp/api/status/pdb_id/dssp/${jobId}/`;
    const response = await axios.get(statusUrl);
    return response.data.status;
  }

  async function getResultOfJob(jobId) {
    const resultUrl = `https://www3.cmbi.umcn.nl/xssp/api/result/pdb_id/dssp/${jobId}/`;
    const response = await axios.get(resultUrl);
    return response.data.result;
  }
}

const formUrlEncoded = x =>
  Object.keys(x).reduce((p, c) => p + `&${c}=${encodeURIComponent(x[c])}`, '')
