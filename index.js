const express = require('express');
const path = require("path");
const axios = require('axios');
const fileupload = require('express-fileupload');
const FormData = require('form-data');

const app = express();

const port = process.env.PORT || 80;

app.use(fileupload());

app.post('/getTheirDssp', async (req, res) => {
  console.log('POST');
  const theirDssp = await getTheirDssp(req.files.file);
  res.send(theirDssp);
});

app.use(express.static(path.join(__dirname, 'front', 'build')));

app.use('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'front', 'build', 'index.html'));
});

app.listen(port, () => console.log('STARTED at ' + port));

async function getTheirDssp(file) {
  const jobId = await createDsspJob(file);

  console.log('jobId: ' + jobId);

  let status = await getStatusOfJob(jobId);

  console.log(status);

  while (status === "STARTED" || status === "PENDING") {
    console.log('status ', status)
    status = getStatusOfJob(jobId);
  }

  return getResultOfJob(jobId);

  async function createDsspJob(file) {
    const createDsspUrl = `https://www3.cmbi.umcn.nl/xssp/api/create/pdb_file/dssp/`;
    const formData = new FormData();
    formData.append('file_', file.data, file.name);
    try {
      const response = await axios.post(createDsspUrl, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });
      return response.data.id;
    } catch(e) {
      console.error(e);
      return null;
    }
  }

  async function getStatusOfJob(jobId) {
    const statusUrl = `https://www3.cmbi.umcn.nl/xssp/api/status/pdb_file/dssp/${jobId}/`;
    const response = await axios.get(statusUrl);
    return response.data.status;
  }

  async function getResultOfJob(jobId) {
    const resultUrl = `https://www3.cmbi.umcn.nl/xssp/api/result/pdb_file/dssp/${jobId}/`;
    const response = await axios.get(resultUrl);
    return response.data.result;
  }
}

