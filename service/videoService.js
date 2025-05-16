exports.saveVideo = async ({ testId, name, file }) => {
  const savedPath = await videoRepo.moveVideo({ testId, name, file });
  return savedPath;
};
