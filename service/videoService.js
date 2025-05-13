exports.saveVideo = async ({ testId, type, file }) => {
  const savedPath = await videoRepo.moveVideo({ testId, type, file });
  return savedPath;
};
