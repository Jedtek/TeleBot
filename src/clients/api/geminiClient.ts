import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../../../config.json' with { type: "json" };

type GeminiQuestion = {
    question: string;
    reply: string;
}

type GeminiConversation = {
    chatId: number;
    data: Array<GeminiQuestion>;
}

type GeminiContext = {
    role: string;
    parts: string;
}

class GeminiClient {
    apiKey: string;
    geminiInstance: any;
    geminiModel: string;
    geminiModelInstance: any;
    conversations: Array<GeminiConversation>;

    constructor() {
        this.apiKey = config.apis.gemini.apiKey;
        this.geminiModel = 'gemini-1.0-pro';
        this.geminiInstance = new GoogleGenerativeAI(this.apiKey);
        this.geminiModelInstance = this.geminiInstance.getGenerativeModel({model: this.geminiModel});
        this.conversations = [];
    }

    async askQuestion(question: string, chatId: number): Promise<string> {
        let conversationHistory: GeminiConversation = this.conversations.find(convo => convo.chatId === chatId);
        if(!conversationHistory) {
            this.conversations.push({
                chatId,
                data: []
            });
            conversationHistory = this.conversations.find(convo => convo.chatId === chatId);
            console.log(`init conversation for chat: ${chatId}`);
        }
        console.log(`asking question: ${question}`);
        let currentContext: Array<GeminiContext> = [];
        if(conversationHistory.data.length) {
            for (let index = 0; index < conversationHistory.data.length; index++) {
                currentContext.push({
                    role: 'user',
                    parts: conversationHistory.data[index].question
                });
                currentContext.push({
                    role: 'model',
                    parts: conversationHistory.data[index].reply
                });
            }
        }
        console.log('conversation array pre-question:');
        console.log(currentContext);
        const convo = this.geminiModelInstance.startChat({
            history: currentContext.length ? currentContext as Array<object> : null, // Sort this out
            generationConfig: {
                maxOutputTokens: 100,
            },
        });

        const result = await convo.sendMessage(question);
        const reply = await result.response;
        const replyText = reply.text();
        console.log(`Got reply: ${replyText}`);
        conversationHistory.data.push({
            question,
            reply: replyText
        });

        return replyText;
    }
}

export default GeminiClient;