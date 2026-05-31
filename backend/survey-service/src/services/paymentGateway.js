const axios = require('axios');
require('dotenv').config();

const PAYMENT_API_BASE = `${process.env.PAYMENT_GATEWAY_URL}/api`;

function getHeaders(creatorId) {
  return {
    Authorization: `Bearer ${process.env.SERVICE_SECRET}`,
    'x-creator-id': creatorId,
  };
}

// Lock creator points when study is published
async function allocatePoints(creatorId, totalPoints, studyId = null) {
  const response = await axios.post(
    `${PAYMENT_API_BASE}/points/allocate`,
    { totalPoints, studyId },
    { headers: getHeaders(creatorId) }
  );
  return response.data;
}

// Release locked points back to creator
async function releasePoints(creatorId, totalPoints, studyId = null) {
  const response = await axios.post(
    `${PAYMENT_API_BASE}/points/release`,
    { totalPoints, studyId },
    { headers: getHeaders(creatorId) }
  );
  return response.data;
}

// Reward participant after phase completion
async function rewardParticipant(participantId, rewardAmount, studyId = null, phaseId = null) {
  const response = await axios.post(
    `${PAYMENT_API_BASE}/points/reward`,
    { participantId, rewardAmount, studyId, phaseId },
    { headers: { Authorization: `Bearer ${process.env.SERVICE_SECRET}` } }
  );
  return response.data;
}

module.exports = { allocatePoints, releasePoints, rewardParticipant };