exports.uploadVideo = async (req, res) => {
  console.log('📥 /video/upload 요청 도착!');
  const { testId, type } = req.body;
  const file = req.file;

  if (!testId || !type || !file) {
    return res.status(400).json({ error: 'testId, type, video 파일이 필요합니다.' });
  }

  try {
    const savedPath = await videoService.saveVideo({ testId, type, file });
    res.json({
      message: '업로드 성공',
      savedPath
    });
  } catch (err) {
    console.error('❌ 저장 실패:', err);
    res.status(500).json({ error: '서버 에러', detail: err.message });
  }
};
