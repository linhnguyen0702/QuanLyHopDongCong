const multer = require('multer');
const path = require('path');

// Cấu hình storage cho multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/contracts'));
  },
  filename: function (req, file, cb) {
    // Tạo tên file unique với timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const name = path.basename(file.originalname, extension);
    cb(null, `${name}-${uniqueSuffix}${extension}`);
  }
});

// Filter để chỉ cho phép các loại file nhất định
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'text/plain'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Loại file không được hỗ trợ. Chỉ chấp nhận: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TXT'), false);
  }
};

// Cấu hình multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Tối đa 5 files
  }
});

// Middleware để upload multiple files
const uploadMultiple = upload.array('attachments', 5);
const uploadNone = multer().none();

// Middleware wrapper để xử lý lỗi
const handleUpload = (req, res, next) => {
  // Debug logging before multer
  console.log('=== UPLOAD MIDDLEWARE DEBUG ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Content-Type:', req.get('Content-Type'));
  console.log('Content-Length:', req.get('Content-Length'));
  
  const contentType = req.get('Content-Type');
  
  if (contentType && contentType.includes('multipart/form-data')) {
    // Use multer for multipart requests
    uploadMultiple(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        console.log('Multer Error:', err.code, err.message);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File quá lớn. Kích thước tối đa là 10MB.'
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: 'Quá nhiều file. Tối đa 5 files.'
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: 'Trường file không mong đợi.'
          });
        }
      }
      if (err) {
        console.log('Upload Error:', err.message);
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      // Debug logging after multer
      console.log('Upload middleware - req.body:', req.body);
      console.log('Upload middleware - req.files:', req.files);
      console.log('Upload middleware - Content-Type:', req.get('Content-Type'));
      console.log('=== END UPLOAD MIDDLEWARE DEBUG ===');
      
      next();
    });
  } else {
    // Use multer.none() for non-multipart requests
    console.log('Using multer.none() for non-multipart request');
    uploadNone(req, res, (err) => {
      if (err) {
        console.log('Multer.none() Error:', err.message);
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      console.log('Multer.none() - req.body:', req.body);
      console.log('=== END UPLOAD MIDDLEWARE DEBUG ===');
      
      next();
    });
  }
};

module.exports = {
  upload,
  uploadMultiple,
  handleUpload
};
