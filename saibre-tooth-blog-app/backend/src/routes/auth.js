const express = require('express');
const multer = require('multer');
const path = require('path');
const { login, register, getUser, updateUser, updateUserImage } = require('../controllers/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/users/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/login', login);
router.post('/register', register);
router.get('/user/:id', getUser);
router.put('/user/:id', updateUser);
router.put('/:userId/image', upload.single('image'), updateUserImage);

module.exports = router;
