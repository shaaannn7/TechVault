import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { protect } from '../middlewares/auth.js';
import { validatePDFHeader } from '../middlewares/pdfValidator.js';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../uploads');
// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
// Storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
    }
});
// File filter (PDF only)
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf') {
        cb(null, true);
    }
    else {
        cb(new Error('Only PDF documents are allowed!'), false);
    }
};
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 25 * 1024 * 1024 } // 25 MB limit
});
// Upload route
router.post('/', protect, upload.single('file'), validatePDFHeader, (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Please attach a PDF file to upload.' });
    }
    // Generate URL path. We serve static /uploads, so URL path is /uploads/<filename>
    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({
        message: 'File uploaded successfully',
        data: {
            fileName: req.file.originalname,
            fileUrl: fileUrl,
            fileSize: req.file.size
        }
    });
});
export default router;
