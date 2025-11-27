import { GoogleGenAI, Modality } from "@google/genai";
import type { Garment } from "../App";

export type VtonCategory = 'women' | 'men' | 'girls' | 'boys' | 'kids' | 'unisex' | 'mother-daughter' | 'father-son' | 'mother-son';
export type SkinTone = 'Fair' | 'Wheatish' | 'Tan' | 'Dark';
export type BodyShape = 'Slim' | 'Average' | 'Curvy' | 'Athletic';
export type Pose = 'Standing' | 'Walking' | 'Sitting' | 'Candid';

// Safely access env vars without crashing if process is undefined
const getApiKey = () => {
  // 1. Try Vite environment variable (standard for Vite apps)
  // Use type assertion to avoid TypeScript errors if types aren't set up
  if ((import.meta as any).env?.VITE_API_KEY) {
    return (import.meta as any).env.VITE_API_KEY;
  }
  
  // 2. Try global window process (polyfill from index.html)
  if (typeof window !== 'undefined' && (window as any).process?.env?.API_KEY) {
    return (window as any).process.env.API_KEY;
  }

  // 3. Try standard process.env (Node/Build-time replacement)
  try {
    if (process.env.API_KEY) {
        return process.env.API_KEY;
    }
  } catch (e) {
    // process is not defined, ignore
  }
  
  return undefined;
};

const API_KEY = getApiKey();

// Lazy initialization
let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
}

export const generateVtonImage = async (
  garments: Record<string, Garment>,
  category: VtonCategory,
  userModelImage: Garment | null = null,
  skinTone: SkinTone = 'Wheatish',
  bodyShape: BodyShape = 'Average',
  pose: Pose = 'Standing'
): Promise<string> => {
  // Check for the client instance here, at runtime
  if (!ai) {
    throw new Error(
      "API Key is missing. In your Netlify Dashboard, go to Site Configuration > Environment Variables and add a key named 'VITE_API_KEY' with your Google API Key value. Then trigger a new deploy."
    );
  }

  const model = 'gemini-2.5-flash-image';
  
  const parts: any[] = [];

  // If user provided a model image, it goes first
  if (userModelImage) {
    parts.push({
      inlineData: {
        data: userModelImage.base64,
        mimeType: userModelImage.mimeType,
      },
    });
  }

  const garmentParts = Object.values(garments).map(g => ({
    inlineData: {
      data: g.base64,
      mimeType: g.mimeType,
    },
  }));

  parts.push(...garmentParts);

  const garmentKeys = Object.keys(garments);
  const garmentListText = garmentKeys.join(', ');
  const garmentKeysLower = garmentKeys.map(k => k.toLowerCase());

  // Background Classification Keywords
  const traditionalKeywords = ['saree', 'lehenga', 'lahenga', 'kurti', 'dupatta', 'anarkali', 'salwar', 'sharara', 'churidar', 'abaya', 'gharara', 'patiala', 'dhoti', 'blouse (saree/lehenga)', 'straight pants (ethnic)', 'kaftan (ethnic)'];
  const nightwearKeywords = ['night', 'lounge', 'kaftan (nightwear)']; 
  const formalKeywords = ['gown', 'maxi', 'evening'];
  const officeKeywords = ['blazer', 'suit', 'formal', 'shirt (formal)', 'trousers (formal)', 'waistcoat'];
  const winterKeywords = ['coat', 'jacket', 'pullover', 'sweater', 'winter', 'cardigan', 'shrug'];
  const casualKeywords = ['jeans', 't-shirt', 'hoodie', 'sweatshirt', 'track suit', 'co-ord'];
  const summerKeywords = ['shorts', 'skirt', 'crop top', 'tank top', 'dress (mini)', 'romper'];
  const swimwearKeywords = ['swim', 'cover-up'];

  // Determine background and atmosphere based on attire type
  let sceneDescription = '';
  let lightingAndTone = '';

  if (garmentKeysLower.some(k => nightwearKeywords.some(nk => k.includes(nk)))) {
    // Nightwear
    sceneDescription = 'a luxurious, dimly lit penthouse bedroom or lounge with plush velvet textures';
    lightingAndTone = 'soft, moody, cinematic night lighting creating a cozy yet high-fashion intimate atmosphere';
  } else if (garmentKeysLower.some(k => swimwearKeywords.some(sk => k.includes(sk)))) {
    // Swimwear / Beach
    sceneDescription = 'a high-end beach club in Ibiza or Maldives with white sand and turquoise water';
    lightingAndTone = 'bright, high-key sunlight with sharp, vibrant contrast';
  } else if (garmentKeysLower.some(k => winterKeywords.some(wk => k.includes(wk)))) {
    // Winter / Outerwear
    sceneDescription = 'a chic, european city street in autumn with fallen leaves, or a stylish snowy urban scene';
    lightingAndTone = 'soft, diffused overcast light with a cool tone, highlighting the textures of the coat/jacket';
  } else if (garmentKeysLower.some(k => officeKeywords.some(ok => k.includes(ok)))) {
    // Office / Formal Workwear
    sceneDescription = 'a modern, glass-walled office interior or a high-rise corporate lobby';
    lightingAndTone = 'clean, professional daylight balancing soft interior lighting';
  } else if (garmentKeysLower.some(k => formalKeywords.some(fk => k.includes(fk)))) {
    // Evening Gowns / Dresses
    sceneDescription = 'a red carpet event with blurred paparazzi lights in the background or a marble grand staircase';
    lightingAndTone = 'dramatic spotlighting with a glamorous, polished editorial finish';
  } else if (garmentKeysLower.some(k => traditionalKeywords.some(tk => k.includes(tk)))) {
    // Traditional / Ethnic
    sceneDescription = 'a grand heritage palace courtyard with intricate sandstone arches and marigolds, or a luxury boutique interior';
    lightingAndTone = 'warm, golden hour sunbeams mixing with rich shadows, enhancing the fabric textures';
  } else if (garmentKeysLower.some(k => summerKeywords.some(sk => k.includes(sk)))) {
    // Summer / Day Wear
    sceneDescription = 'a sunny, vibrant botanical garden or a chic outdoor cafe terrace';
    lightingAndTone = 'bright, natural daylight with warm sun flare';
  } else if (category === 'unisex' || garmentKeysLower.some(k => casualKeywords.some(ck => k.includes(ck)))) {
    // Streetwear / Unisex / Casual
    sceneDescription = 'a gritty, neon-lit cyberpunk city street at night or a minimal concrete fashion studio';
    lightingAndTone = 'neon accents (purple/blue) mixed with hard rim lighting for an edgy streetwear look';
  } else {
    // Generic Modern
    sceneDescription = 'a sleek, modern architectural space with glass walls and city skyline views';
    lightingAndTone = 'clean, sophisticated studio lighting with soft shadows';
  }

  // Adjust scene slightly based on pose
  if (pose === 'Sitting') {
    if (sceneDescription.includes('garden')) sceneDescription += ', sitting gracefully on a vintage bench';
    else if (sceneDescription.includes('bedroom')) sceneDescription += ', sitting on the edge of the bed';
    else if (sceneDescription.includes('courtyard')) sceneDescription += ', sitting on a traditional diwan';
    else if (sceneDescription.includes('pool')) sceneDescription += ', sitting on a lounge chair';
    else if (sceneDescription.includes('office')) sceneDescription += ', sitting on a modern office chair';
    else sceneDescription += ', sitting on a designer chair';
  } else if (pose === 'Walking') {
     sceneDescription += ', caught in mid-stride walking towards the camera with confidence';
  }

  const skinToneDesc = skinTone.toLowerCase(); // e.g., "fair", "wheatish"
  const bodyDesc = bodyShape.toLowerCase(); // e.g., "slim", "curvy"
  const poseDesc = pose === 'Candid' ? 'laughing naturally in a candid moment' : `${pose.toLowerCase()} with high-fashion elegance`;

  // Define Subjects based on Category
  let subjectDescription = '';
  let outfitInstruction = '';
  const baseInstruction = `wearing the outfit composed of the following items: ${garmentListText}`;

  // Helper strings
  const adultFemale = `a stunningly beautiful ${skinToneDesc}-skinned woman in her 20s with a ${bodyDesc} figure, glowing skin, and stylish hair`;
  const adultMale = `a handsome ${skinToneDesc}-skinned man in his 20s with a ${bodyDesc} build and stylish short hair`;
  const childFemale = `an adorable ${skinToneDesc}-skinned girl around 8-10 years old with a happy expression`;
  const childMale = `a cute ${skinToneDesc}-skinned boy around 8-10 years old with a cheerful smile`;
  const genericKid = `a happy and photogenic ${skinToneDesc}-skinned child around 8 years old`;
  const unisexModel = `a trendy, photogenic young adult model with a ${bodyDesc} build and a cool, modern look`;

  switch (category) {
    case 'women':
      subjectDescription = `${adultFemale}, ${poseDesc}, looking at the camera`;
      outfitInstruction = `The woman MUST be ${baseInstruction}.`;
      break;
    case 'men':
      subjectDescription = `${adultMale}, ${poseDesc}, looking at the camera`;
      outfitInstruction = `The man MUST be ${baseInstruction}.`;
      break;
    case 'girls':
      subjectDescription = `${childFemale}, ${poseDesc}, looking at the camera`;
      outfitInstruction = `The girl MUST be ${baseInstruction}.`;
      break;
    case 'boys':
      subjectDescription = `${childMale}, ${poseDesc}, looking at the camera`;
      outfitInstruction = `The boy MUST be ${baseInstruction}.`;
      break;
    case 'kids':
      subjectDescription = `${genericKid}, ${poseDesc}, looking at the camera`;
      outfitInstruction = `The child MUST be ${baseInstruction}.`;
      break;
    case 'unisex':
      subjectDescription = `${unisexModel}, ${poseDesc}, in a studio setting`;
      outfitInstruction = `The model MUST be ${baseInstruction}.`;
      break;
    case 'mother-daughter':
      subjectDescription = `${adultFemale} and ${childFemale} standing next to her. They are positioned side-by-side, ${poseDesc}`;
      outfitInstruction = `Both the mother and the daughter MUST be ${baseInstruction} (matching outfits).`;
      break;
    case 'father-son':
      subjectDescription = `${adultMale} and ${childMale} standing next to him. They are positioned side-by-side, ${poseDesc}`;
      outfitInstruction = `Both the father and the son MUST be ${baseInstruction} (matching outfits).`;
      break;
    case 'mother-son':
      subjectDescription = `${adultFemale} and ${childMale} standing next to her. They are positioned side-by-side, ${poseDesc}`;
      outfitInstruction = `Both the mother and the son MUST be ${baseInstruction} (matching outfits).`;
      break;
    default:
        // Fallback
        subjectDescription = `${adultFemale}, ${poseDesc}`;
        outfitInstruction = `The subject MUST be ${baseInstruction}.`;
  }

  let textPrompt = '';

  // Common rendering instructions
  const renderingInstructions = `
      Garment Rendering Instructions:
      - "Kurti (Anarkali)" / "Kurti (Flared)": Render as a frock-style top with a fitted bodice and a voluminous flared skirt part.
      - "Kurti (Long)": Render as a long tunic reaching the calves or ankles.
      - "Kurti (Short)": Render as a short tunic ending at the hips.
      - "Straight Pants (Ethnic)": Render as slim-fit, straight-cut trousers ending at the ankle (cigarette pants).
      - "Kaftan (Ethnic)": Render as a rich, flowy, traditional full-length robe with intricate details.
      - "Kaftan (Nightwear)": Render as a soft, comfortable, loose-fitting lounge robe.
      - "Kaftan (Top)": Render as a stylish, loose-fitting tunic top.
      - "Saree": Render as a traditionally draped 6-yard fabric with appropriate pleats.
      - "Lehenga": Render as a voluminous, floor-length skirt with a matching blouse.
      - "Sharara" / "Gharara": Render as wide-legged traditional trousers that flare out dramatically at the bottom.
      - "Gown" / "Dress (Maxi)": Render as a floor-length formal garment.
      - "Jumpsuit": Render as a seamless one-piece top and pant combination.
      - "Hoodie" / "Oversized T-Shirt": Render with a relaxed, streetwear fit.
      - "Swimsuit": Render as fitted swimwear material.
      - "Co-ord Set": Render as a matching top and bottom set.
      - "Cap" / "Hat" / "Beanie": Render as stylish headwear worn naturally on the head.
  `;

  if (userModelImage) {
    textPrompt = `
      The first image provided is the reference photo of the subject(s).
      The subsequent images are garment items to be tried on.
      Garment List: ${garmentListText}.
      
      Generate a high-resolution, photorealistic image of the person(s) from the first reference image wearing the provided garments.
      
      CRITICAL INSTRUCTION: ${outfitInstruction.replace('MUST be', 'must be shown')}
      
      Maintain the facial features, body type, and pose of the reference model as much as possible, but adapt the pose to be ${pose} if it looks natural.
      Ensure the skin tone and lighting on the face matches the new environment naturally.
      
      Background & Atmosphere:
      The background should be ${sceneDescription}.
      The lighting and mood should be ${lightingAndTone}.
      
      ${renderingInstructions}
    `;
  } else {
    textPrompt = `
      Generate a high-resolution, photorealistic, full-body fashion shot of ${subjectDescription} in ${sceneDescription}.
      
      CRITICAL INSTRUCTION: ${outfitInstruction}
      
      Lighting & Atmosphere:
      ${lightingAndTone}
      
      ${renderingInstructions}
      
      Each garment, provided in the input images, should be realistically rendered and combined to fit the subject(s) naturally and correctly as a complete outfit.
      The background should be detailed but slightly blurred (bokeh) to keep focus on the fashion.
      Ensure the models look highly realistic with natural skin texture and lighting.
    `;
  }

  parts.push({ text: textPrompt });

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: parts,
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const firstPart = response.candidates?.[0]?.content?.parts?.[0];

    if (firstPart && 'inlineData' in firstPart && firstPart.inlineData) {
      return firstPart.inlineData.data;
    } else {
      throw new Error('No image data found in the API response.');
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if(error instanceof Error && error.message.includes('API_KEY')){
        throw new Error("Invalid API Key. Please check your configuration.");
    }
    throw new Error('Failed to generate image. The model may have refused the request due to safety policies or other issues.');
  }
};