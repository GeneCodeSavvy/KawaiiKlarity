declare module 'react-speech-recognition' {
  interface SpeechRecognitionOptions {
    continuous?: boolean;
    language?: string;
  }

  interface UseSpeechRecognitionReturn {
    transcript: string;
    listening: boolean;
    resetTranscript: () => void;
    browserSupportsSpeechRecognition: boolean;
    isMicrophoneAvailable: boolean;
    finalTranscript: string;
  }

  export function useSpeechRecognition(): UseSpeechRecognitionReturn;

  interface SpeechRecognitionStatic {
    startListening: (options?: SpeechRecognitionOptions) => void;
    stopListening: () => void;
    abortListening: () => void;
  }

  const SpeechRecognition: SpeechRecognitionStatic;
  export default SpeechRecognition;
}