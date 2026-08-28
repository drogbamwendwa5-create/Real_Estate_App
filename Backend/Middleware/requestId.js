const crypto = require('crypto');

// Generate or honor a client-supplied request id, attach to req.id and respond
// with an X-Request-Id header so logs and clients can correlate requests.
const REQUEST_ID_HEADER = 'X-Request-Id';

const requestId = () => (req, res, next) => {
  const incoming = req.get && req.get(REQUEST_ID_HEADER);
  const id = (incoming && /^[A-Za-z0-9._:-]{1,128}$/.test(incoming))
    ? incoming
    : crypto.randomUUID();
  req.id = id;
  res.setHeader(REQUEST_ID_HEADER, id);
  next();
};

module.exports = { requestId, REQUEST_ID_HEADER };
