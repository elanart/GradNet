import "dotenv/config";

export default {
  expo: {
    name: "gradnetmobile",
    slug: "gradnetmobile",
    plugins: [
      [
        "expo-image-picker",
        {
          photosPermission: "custom photos permission",
          cameraPermission: "Allow $(PRODUCT_NAME) to open the camera",
          microphonePermission: false,
        },
      ],
    ],
    version: "1.0.0",
  },
  extra: {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.DATABASE_URL,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID,
  },
};
