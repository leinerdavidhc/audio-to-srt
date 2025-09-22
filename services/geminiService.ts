import { GoogleGenAI, Type } from "@google/genai";
import { SubtitleLine } from "../types";
import { parseTime } from "../utils/time";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function transcribeAudioWithTimestamps(base64Audio: string, mimeType: string, durationInSeconds: number): Promise<SubtitleLine[]> {
  try {
    const audioPart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Audio,
      },
    };
    
    const textPart = {
      text: `Transcribe the following audio recording accurately. The total audio duration is approximately ${Math.round(durationInSeconds)} seconds. 
      Structure the output as a list of subtitle entries. Each entry must have a start time, an end time, and the transcribed text for that segment.
      Ensure the timestamps are in HH:MM:SS,ms format and are sequential and logical within the audio's duration.`
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [textPart, audioPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              startTime: {
                type: Type.STRING,
                description: "The start time of the subtitle segment in HH:MM:SS,ms format.",
              },
              endTime: {
                type: Type.STRING,
                description: "The end time of the subtitle segment in HH:MM:SS,ms format.",
              },
              text: {
                type: Type.STRING,
                description: "The transcribed text for this segment.",
              },
            },
            required: ["startTime", "endTime", "text"],
          },
        },
      },
    });

    const jsonResponse = JSON.parse(response.text);

    if (!Array.isArray(jsonResponse)) {
        throw new Error("API did not return a valid array of subtitles.");
    }

    return jsonResponse.map((item: any, index: number) => ({
        id: Date.now() + index,
        start: parseTime(item.startTime),
        end: parseTime(item.endTime),
        text: item.text,
    }));

  } catch (error) {
    console.error("Error transcribing audio with timestamps:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API.");
  }
}