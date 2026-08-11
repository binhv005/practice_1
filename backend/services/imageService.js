const cloudinary = require("../config/cloudinary");

const processProductImage = async (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "products",
        resource_type: "image",
        format: "webp",
        transformation: [
          {
            width: 800,
            height: 600,
            crop: "fill",
            gravity: "center",
            quality: "auto",
          },
        ],
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result.secure_url);
      },
    );

    stream.end(file.buffer);
  });
};

module.exports = {
  processProductImage,
};
