import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the API token from env
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export const performDocumentOCR = async (base64Image: string, mimeType: string) => {
    if (!apiKey) {
        throw new Error("Gemini API key is not configured.");
    }
    
    try {
        // We use gemini-2.5-flash as it is fast and supports vision tasks well
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
        
        // Clean markdown JSON wrapping if present
        const cleanedText = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
        
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("OCR Extraction failed:", error);
        throw error;
    }
};

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64String = reader.result as string;
            // Remove the data URL prefix (e.g., data:image/jpeg;base64,) if only sending the raw base64 data to Gemini, 
            // but the inlineData requires raw data.
            const rawBase64 = base64String.split(',')[1];
            resolve(rawBase64);
        };
        reader.onerror = error => reject(error);
    });
};
