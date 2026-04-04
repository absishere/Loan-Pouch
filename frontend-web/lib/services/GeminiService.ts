import { GoogleGenerativeAI } from '@google/generative-ai';

export const performDocumentOCR = async (base64Image: string, mimeType: string) => {
    // Next.js exposes NEXT_PUBLIC_* variables to the browser
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    
    if (!apiKey) {
        console.error("Gemini API key is missing from environment variables (NEXT_PUBLIC_GEMINI_API_KEY).");
        throw new Error("Gemini API key is not configured.");
    }
    
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Use gemini-2.5-flash as the current stable version in 2026
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        console.log("OCR: Sending image to Gemini for processing...");

        const prompt = `
        Analyze this ID document (Aadhar or PAN card) and extract the following details in a strict JSON format. 
        Do not add any markdown formatting or extra text outside the JSON.
        Required JSON fields:
        {
          "name": "Full legal name as seen on the card",
          "dob": "Date of birth in DD/MM/YYYY format if present, else empty string",
          "documentNumber": "The PAN number or Aadhar number",
          "documentType": "Either 'Aadhar' or 'PAN'"
        }
        `;

        const imageParts = [
            {
                inlineData: {
                    data: base64Image,
                    mimeType
                }
            }
        ];

        const result = await model.generateContent([prompt, ...imageParts]);
        const responseText = result.response.text();
        
        console.log("OCR: Gemini raw response received:", responseText);

        // Clean markdown JSON wrapping if present
        const cleanedText = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
        
        try {
            const parsedData = JSON.parse(cleanedText);
            console.log("OCR: Parsed data successfully:", parsedData);
            return parsedData;
        } catch (parseError) {
            console.error("OCR: Failed to parse Gemini response as JSON. Raw text:", responseText);
            throw new Error("Failed to parse document data.");
        }
    } catch (error: any) {
        console.error("OCR Extraction failed:", error);
        if (error?.message?.includes("API_KEY_INVALID")) {
            throw new Error("Invalid Gemini API Key. Please check your .env file.");
        }
        throw new Error(error?.message || "OCR Extraction failed.");
    }
};

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64String = reader.result as string;
            const rawBase64 = base64String.split(',')[1];
            resolve(rawBase64);
        };
        reader.onerror = error => reject(error);
    });
};
