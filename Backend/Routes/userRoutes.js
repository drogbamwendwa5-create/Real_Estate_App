const express = require('express');
const router = express.Router();
const { protect, requirePermission } = require('../Middleware/auth');
const { singleUpload } = require('../Middleware/upload');
const validate = require('../Middleware/validation');
const { updateProfileValidation, updateUserValidation } = require('../Validators/userValidators');
const { getUsers, getUser, updateUser, deleteUser, updateProfile, deleteAccount, uploadAvatar } = require('../Controllers/userController');

router.get('/', protect, requirePermission('manage-users'), getUsers);
router.get('/:id', protect, getUser);
router.put('/:id', protect, requirePermission('manage-users'), ...updateUserValidation, validate, updateUser);
router.delete('/:id', protect, requirePermission('manage-users'), deleteUser);
router.put('/profile', protect, ...updateProfileValidation, validate, updateProfile);
router.delete('/account', protect, deleteAccount);
router.post('/avatar', protect, singleUpload, uploadAvatar);

module.exports = router;