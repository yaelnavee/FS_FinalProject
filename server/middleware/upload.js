const multer = require('multer');
const path = require('path');
const fs = require('fs');

// יצירת תיקיית uploads אם לא קיימת
const uploadDir = path.join(__dirname, '../uploads/images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // שמירת קובץ עם תאריך ושם ייחודי
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'pizza-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // אפשר רק קבצי תמונה
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('רק קבצי תמונה מותרים (JPG, PNG, GIF)'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB מקסימום
  },
  fileFilter: fileFilter
});

module.exports = upload;