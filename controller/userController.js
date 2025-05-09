const userService = require('../service/userService');

//유저 생성
exports.createUser = async (req, res) => {
    try {
        const userData = req.body;
        const result = await userService.createUser(userData);
        res.status(201).json({ message: 'User created successfully', data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//유저 삭제
exports.deleteUser = async (req, res) => {
    try {
        const { license_no } = req.body;
        await userService.deleteUser(license_no);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//email,password로 유저 찾기-로그인

exports.findUserByEmailAndPassword = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email과 password를 모두 입력해주세요.' });
  }

  const user = await userService.findUserByEmailAndPassword(email, password);

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json({ error: '일치하는 유저를 찾을 수 없습니다.' });
  }
};


//자격증으로 유저 찾기
exports.findUserByLicenseNo = async (req, res) => {
    try {
        const { license_no } = req.body;
        const user = await userService.findUserByLicenseNo(license_no);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
