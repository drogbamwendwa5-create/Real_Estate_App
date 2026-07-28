const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../Middleware/auth');
const { singleUpload } = require('../Middleware/upload');
const validate = require('../Middleware/validation');
const { updateProfileValidation, updateUserValidation } = require('../Validators/userValidators');
const { getUsers, getUser, updateUser, deleteUser, updateProfile, deleteAccount, uploadAvatar } = require('../Controllers/userController');

router.get('/', protect, authorize('admin'), getUsers);
router.get('/:id', protect, getUser);
router.put('/:id', protect, authorize('admin'), ...updateUserValidation, validate, updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);
router.put('/profile', protect, ...updateProfileValidation, validate, updateProfile);
router.delete('/account', protect, deleteAccount);
router.post('/avatar', protect, singleUpload, uploadAvatar);

module.exports = router;