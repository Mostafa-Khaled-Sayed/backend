// const express = require("express");
// const path = require("path");
// const cors = require("cors");
// const multer = require("multer");
// const { v2: cloudinary } = require("cloudinary");
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// require("dotenv").config();

// const app = express();
// const port = process.env.PORT || 3000;

// // Cloudinary configuration
// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Cloudinary storage configuration
// const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: async (req, file) => {
//         let folderName = "uploads";
//         let format = file.mimetype.split("/")[1];

//         if (file.mimetype.startsWith("image")) {
//             folderName = "images";
//         } else if (file.mimetype.startsWith("video")) {
//             folderName = "videos";
//             return {
//                 folder: folderName,
//                 format: format,
//                 public_id: `category-${encodeURIComponent(
//                     file.originalname.split(".")[0]
//                 )}-${Date.now()}`,
//                 resource_type: "video",
//             };
//         } else if (file.mimetype === "application/pdf") {
//             folderName = "pdfs";
//             format = "pdf";
//         }

//         return {
//             folder: folderName,
//             format: format,
//             public_id: `category-${encodeURIComponent(
//                 file.originalname.split(".")[0]
//             )}-${Date.now()}`,
//         };
//     },
// });

// function multerFilter(req, file, cb) {
//     const fileType = file.mimetype.split("/")[0];
//     if (
//         fileType.startsWith("image") ||
//         fileType.startsWith("video") ||
//         file.mimetype === "application/pdf"
//     ) {
//         cb(null, true);
//     } else {
//         req.fileValidationError = "Only Images, Videos, and PDFs are allowed!";
//         cb(null, false);
//     }
// }

// const upload = multer({
//     storage: storage,
//     fileFilter: multerFilter,
//     limits: { fileSize: 50 * 1024 * 1024 },
// }); // 50 MB limit

// const corsOptions = {
//     origin: "*",
//     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true,
// };

// app.use(cors(corsOptions));
// app.use(express.json());
// app.use(express.static(path.join(__dirname, "public")));

// // Serve static files from the 'public' directory
// app.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname, "public", "index.html"));
// });

// app.post("/upload", upload.single("file"), (req, res) => {
//     if (req.fileValidationError) {
//         return res.status(400).json({ message: req.fileValidationError });
//     }
//     if (!req.file) {
//         return res.status(400).json({ message: "Please upload a file" });
//     }

//     try {
//         console.log("File uploaded successfully:", req.file);
//         res.status(200).json({
//             message: req.file.path,
//         });
//     } catch (err) {
//         console.error("Error uploading file:", err);
//         res.status(500).json({
//             message: "Error uploading file",
//             error: err.message,
//         });
//     }
// });

// // Global error handler
// app.use((err, req, res) => {
//     console.error("Global error handler:", err.stack);
//     res.status(500).json({
//         message: "Something went wrong!",
//         error: err.message,
//     });
// });

// app.listen(port, () => {
//     console.log("Server is running on http:"); //localhost:${port});
// });



const express = require("express");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    resource_type: "auto", // This allows any type of file (image/video/etc.)
  },
});

function multerFilter(req, file, cb) {
  const fileType = file.mimetype.split("/")[0];
  if (
    fileType.startsWith("image") ||
    fileType.startsWith("video") ||
    fileType === "application"
  ) {
    cb(null, true);
  } else {
    req.fileValidationError = "Only Images, Videos, and PDFs are allowed!";
    cb(null, false);
  }
}

const upload = multer({ storage: storage, fileFilter: multerFilter });

const corsOptions = {
  origin: "*",
  // origin: "http://localhost:8082",
  // origin: "https://backend-tan-six-99.vercel.app/",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please upload a file" });
  }

  const filePath = req.file.path;
  const fileType = req.file.mimetype;
  const isVideo = fileType.split("/")[0].startsWith("video");
  const isImage = fileType.split("/")[0].startsWith("image");
  const isPdf = fileType === "application/pdf";

  console.log("File type:", fileType);
  console.log("Is Video:", isVideo);
  console.log("Is Image:", isImage);
  console.log("Is PDF:", isPdf);

  if (isVideo) {
    cloudinary.uploader
      .upload(filePath, {
        folder: "videos",
        resource_type: "video",
        public_id: `videos/${encodeURIComponent(
          req.file.originalname.split(".")[0]
        )}-${Date.now()}`,
        eager: [{ width: 720, crop: "scale", audio_codec: "auto" }],
        eager_async: true,
      })
      .then((result) => {
        console.log("Upload success:", result);
        return res.status(200).json({
          data: result.secure_url,
        });
      })
      .catch((error) => {
        console.error("Upload error:", error);
        res.status(500).json({
          message: "Upload failed",
          error: error.message,
        });
      });
  } else if (isImage) {
    cloudinary.uploader
      .upload(filePath, {
        folder: "images",
        resource_type: "image",
        public_id: `images/${encodeURIComponent(
          req.file.originalname.split(".")[0]
        )}-${Date.now()}`,
      })
      .then((result) => {
        console.log("Upload success:", result);
        return res.status(200).json({
          data: result.secure_url,
        });
      })
      .catch((error) => {
        console.error("Upload error:", error);
        res.status(500).json({
          message: "Upload failed",
          error: error.message,
        });
      });
  } else if (isPdf) {
    cloudinary.uploader
      .upload(filePath, {
        pages: true,
        format: "pdf",
        folder: "pdfs",
        resource_type: "raw",
        public_id:`pdfs/${req.file.originalname.split(".")[0]}-${Date.now()}`,
      })
      .then((result) => {
        console.log("Upload success:", result);
        return res.status(200).json({
          data: result.secure_url,
        });
      })
      .catch((error) => {
        console.error("Upload error:", error);
        res.status(500).json({
          message: "Upload failed",
          error: error.message,
        });
      });
  } else {
    res.status(400).json({
      message: "Unsupported file type",
    });
  }
});

app.get("/upload", async (req, res) => {
  if (req.query.url) {
    let assetId = req.query.url;
    const assetIdList = assetId.split("/").slice(7, assetId.length);
    const assetIdLastIndex =
      assetIdList[assetIdList.length - 1].lastIndexOf(".");
    const ext = assetIdList[assetIdList.length - 1].slice(assetIdLastIndex + 1);
    console.log(ext);
    assetId = [
      ...assetIdList.slice(0, assetIdList.length - 1),
      assetIdList[assetIdList.length - 1].slice(0, assetIdLastIndex),
    ].join("/");
    assetId = assetId.includes("pdfs") ?` ${assetId}.${ext} `: assetId;
    console.log(assetId);
    console.log(
      assetId.includes("images"),
      assetId.includes("videos"),
      assetId.includes("pdfs")
    );
    try {
      const asset = await cloudinary.api.resource(assetId, {
        resource_type: assetId.includes("videos")
          ? "video"
          : assetId.includes("images")
          ? "image"
          : assetId.includes("pdfs")
          ? "raw"
          : "auto",
      });

      // Send the asset details as a response
      res.status(200).json(asset);
    } catch (error) {
      console.error("Error fetching asset:", error);
      res.status(500).json({ error: "Asset not found" });
    }
  } else {
    res.status(400).json({ error: "Asset ID is required" });
  }
});

// Route to delete the asset from Cloudinary by its public ID
app.delete("/upload", async (req, res) => {
  if (req.query.url) {
    let assetId = req.query.url;
    const assetIdList = assetId.split("/").slice(7, assetId.length);
    const assetIdLastIndex =
      assetIdList[assetIdList.length - 1].lastIndexOf(".");
    const ext = assetIdList[assetIdList.length - 1].slice(assetIdLastIndex + 1);
    console.log(ext);
    assetId = [
      ...assetIdList.slice(0, assetIdList.length - 1),
      assetIdList[assetIdList.length - 1].slice(0, assetIdLastIndex),
    ].join("/");
    assetId = assetId.includes("pdfs") ? `${assetId}.${ext}` : assetId;
    console.log(assetId);
    console.log(
      assetId.includes("images"),
      assetId.includes("videos"),
      assetId.includes("pdfs")
    );
    try {
      // Delete the asset from Cloudinary
      const result = await cloudinary.uploader.destroy(assetId, {
        resource_type: assetId.includes("images")
          ? "image"
          : assetId.includes("videos")
          ? "video"
          : "raw",
        invalidate: true,
      });

      if (result.result === "ok") {
        res.json({ message: "Asset deleted successfully" });
      } else {
        res.status(404).json({ error: "Asset not found" });
      }
    } catch (error) {
      console.error("Error deleting asset:", error);
      res.status(500).json({ error: "Failed to delete asset" });
    }
  } else {
    res.status(400).json({ error: "Asset ID is required" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});