const express = require("express");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config(); // تحميل متغيرات البيئة

const app = express();
const port = process.env.PORT || 3000;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folderName = "uploads";
    let format = file.mimetype.split("/")[1];

    if (file.mimetype.startsWith("image")) {
      folderName = "images";
    } else if (file.mimetype.startsWith("video")) {
      folderName = "videos";
    } else if (file.mimetype === "application/pdf") {
      folderName = "pdfs";
      format = "pdf";
    }

    return {
      folder: folderName,
      format: format,
      public_id: `category-${file.originalname.split(".")[0]}-${Date.now()}`,
    };
  },
});

function multerFilter(req, file, cb) {
  const fileType = file.mimetype.split("/")[0];
  if (
    fileType.startsWith("image") ||
    fileType.startsWith("video") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    req.fileValidationError = "Only Images, Videos, and PDFs are allowed!";
    cb(null, false);
  }
}

const upload = multer({ storage: storage, fileFilter: multerFilter });

const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post("/upload", upload.single("file"), (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).json({ message: req.fileValidationError });
  }
  if (!req.file) {
    return res.status(400).json({ message: "Please upload a file" });
  }
  res.status(200).json({
    message: req.file.path,
  });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
