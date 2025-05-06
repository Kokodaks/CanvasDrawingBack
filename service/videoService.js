const videoRepo = require('../repo/videoRepo');
const path = require('path');

exports.saveVideo = async ({ id, name, file }) => {
  const savedPath = await videoRepo.moveVideo({ id, name, file });
  return savedPath;
};
