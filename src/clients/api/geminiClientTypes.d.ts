type GeminiQuestion = {
    question: string;
    reply: string;
};

type GeminiConversation = {
    chatId: number;
    data: Array<GeminiQuestion>;
};

type GeminiContext = {
    role: string;
    parts: string;
};

export type { GeminiQuestion, GeminiConversation, GeminiContext };