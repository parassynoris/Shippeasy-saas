const axios = require('axios');

const jasperUrl = process.env.JASPER_URL;
const jasperheader = {
  "Authorization": `Basic ${process.env.JASPER_Auth}`,
  "Content-Type": "application/pdf",
}

exports.downloadReport = async (req, res, next) => {
  try {
    let headers = { params: { ...req.body?.parameters },headers: jasperheader, responseType: "arraybuffer",  };
    let jasperdata = await axios.get(
      `${jasperUrl}/jasperserver/rest_v2/reports/${process.env.JASPER_PATH}/${req.query?.reportName}.${req.query?.format}`,
      headers
    );

    res.status(200).send(jasperdata.data)
  } catch (e) {
    console.error(JSON.stringify({
        traceId : req?.traceId,
        error: e,
        stack : e?.stack
    }))
    res.status(500).json({ error: e.message});
  }
}

exports.downloadReportOpenApi = async (req, res, next) => {
  if (req.query?.reportName === "quoatation"){
    try {
      let headers = { params: { ...req.body?.parameters },headers: jasperheader, responseType: "arraybuffer",  };
      let jasperdata = await axios.get(
        `${jasperUrl}/jasperserver/rest_v2/reports/${process.env.JASPER_PATH}/${req.query?.reportName}.${req.query?.format}`,
        headers
      );
  
      res.status(200).send(jasperdata.data)
    } catch (e) {
      res.status(500).json({ error: e.message});
    }
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
}