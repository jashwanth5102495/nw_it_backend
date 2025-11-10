const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Certificate = require('../models/Certificate');
const Student = require('../models/Student');

// Ensure frontend certificates directory exists (store uploads under frontend project)
const uploadDir = path.join(__dirname, '..', '..', 'nw_it_frontend', 'video-explanations', 'topics', 'certificates');
fs.mkdirSync(uploadDir, { recursive: true });

// Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const studentId = (req.body.studentId || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '');
    const ext = path.extname(file.originalname);
    // Save as <studentId>.<ext> so the career page can map directly by studentId
    cb(null, `${studentId}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Unsupported file type. Allowed: PDF, PNG, JPG/JPEG'));
  }
});

// Upload certificate
router.post('/upload', upload.single('certificate'), async (req, res) => {
  try {
    const { studentId, courseId } = req.body;
    if (!studentId) return res.status(400).json({ success: false, message: 'studentId is required' });
    if (!req.file) return res.status(400).json({ success: false, message: 'certificate file is required' });

    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const filePath = path.join('video-explanations', 'topics', 'certificates', req.file.filename);
    const baseUrl = process.env.VITE_FRONTEND_URL || `http://localhost:${process.env.FRONTEND_PORT || 5174}`;
    const fileUrl = `${baseUrl}/${filePath.replace(/\\/g, '/')}`;

    // Deactivate previous active certificate for student
    await Certificate.updateMany({ student: student._id, active: true }, { $set: { active: false } });

    const cert = await Certificate.create({
      student: student._id,
      studentIdString: student.studentId,
      course: courseId || undefined,
      filePath,
      fileUrl,
      mimeType: req.file.mimetype,
      official: true,
      active: true
    });

    return res.json({ success: true, certificate: cert });
  } catch (err) {
    console.error('Certificate upload error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Verify certificate by studentId
router.get('/verify/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const cert = await Certificate.findOne({ studentIdString: studentId, active: true }).populate('student').populate('course');
    if (!cert) return res.status(404).json({ success: false, message: 'No active certificate found for this studentId' });

    // Prefer a frontend certificate file mapped by studentId if present
    const frontendDir = path.join(__dirname, '..', '..', 'nw_it_frontend', 'video-explanations', 'topics', 'certificates');
    const frontendBase = process.env.VITE_FRONTEND_URL || `http://localhost:${process.env.FRONTEND_PORT || 5174}`;
    const candidates = ['.png', '.jpg', '.jpeg', '.pdf'].map(ext => path.join(frontendDir, `${cert.studentIdString}${ext}`));
    let resolvedUrl = cert.fileUrl;
    let resolvedMime = cert.mimeType;
    let foundFrontend = false;
    for (const abs of candidates) {
      if (fs.existsSync(abs)) {
        const rel = path.join('video-explanations', 'topics', 'certificates', path.basename(abs));
        resolvedUrl = `${frontendBase}/${rel.replace(/\\/g, '/')}`;
        const ext = path.extname(abs).toLowerCase();
        resolvedMime = ext === '.pdf' ? 'application/pdf' : (ext === '.png' ? 'image/png' : 'image/jpeg');
        foundFrontend = true;
        break;
      }
    }

    // If not found, but an older backend file exists, copy it into the frontend folder
    if (!foundFrontend && cert.fileUrl) {
      try {
        const backendFilename = cert.fileUrl.split('/').pop();
        const backendAbs = path.join(__dirname, '..', 'uploads', 'certificates', backendFilename);
        if (fs.existsSync(backendAbs)) {
          const ext = path.extname(backendFilename).toLowerCase();
          const targetAbs = path.join(frontendDir, `${cert.studentIdString}${ext}`);
          fs.copyFileSync(backendAbs, targetAbs);
          const rel = path.join('video-explanations', 'topics', 'certificates', path.basename(targetAbs));
          resolvedUrl = `${frontendBase}/${rel.replace(/\\/g, '/')}`;
          resolvedMime = ext === '.pdf' ? 'application/pdf' : (ext === '.png' ? 'image/png' : 'image/jpeg');
        }
      } catch (copyErr) {
        console.warn('Could not migrate backend certificate to frontend dir:', copyErr);
      }
    }

    return res.json({
      success: true,
      data: {
        studentId: cert.studentIdString,
        studentName: cert.student ? `${cert.student.firstName} ${cert.student.lastName}` : undefined,
        courseTitle: cert.course ? cert.course.title : undefined,
        fileUrl: resolvedUrl,
        mimeType: resolvedMime,
        message: 'This certificate is officially certified and awarded by the Jasnav Group.'
      }
    });
  } catch (err) {
    console.error('Certificate verify error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;