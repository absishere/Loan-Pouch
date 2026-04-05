import * as faceapi from 'face-api.js';

let modelsLoaded = false;

// Call this once when your app/component loads
export const loadModels = async () => {
    if (modelsLoaded) return;
    try {
        const MODEL_URL = '/models'; 
        
        await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),    // Detects faces
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL), // Detects face features
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL) // Used to compare two faces
        ]);
        console.log("Models loaded successfully!");
        modelsLoaded = true;
    } catch (error) {
        console.error("Error loading face-api models:", error);
    }
};

export const verifyIdentity = async (selfieImageElement: HTMLImageElement | HTMLVideoElement, idImageElement: HTMLImageElement) => {
    // 1. Get the face descriptor "fingerprint" for the selfie
    const selfieDetection = await faceapi.detectSingleFace(selfieImageElement)
        .withFaceLandmarks()
        .withFaceDescriptor();

    // 2. Get the face descriptor for the ID image
    const idDetection = await faceapi.detectSingleFace(idImageElement)
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (!selfieDetection || !idDetection) {
        return { match: false, confidence: 0, error: "Could not detect a face in one of the images." };
    }

    // 3. Compare the two faces mathematically
    const distance = faceapi.euclideanDistance(selfieDetection.descriptor, idDetection.descriptor);

    // 0 is a perfect match. Anything under 0.6 is generally considered the same person.
    const isMatch = distance < 0.6;
    
    return { match: isMatch, confidence: (1 - distance) * 100, distance };
};

export const verifyLivenessFromVideo = async (videoElement: HTMLVideoElement) => {
    const first = await faceapi.detectSingleFace(videoElement)
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (!first) {
        return { live: false, confidence: 0, reason: "No face detected in first frame." };
    }

    await new Promise((resolve) => setTimeout(resolve, 1300));

    const second = await faceapi.detectSingleFace(videoElement)
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (!second) {
        return { live: false, confidence: 0, reason: "No face detected in second frame." };
    }

    const drift = faceapi.euclideanDistance(first.descriptor, second.descriptor);
    const isLive = drift > 0.02 && drift < 0.55;
    const confidence = Math.max(0, Math.min(100, (1 - Math.abs(0.2 - drift)) * 100));

    return { live: isLive, confidence, drift };
};
