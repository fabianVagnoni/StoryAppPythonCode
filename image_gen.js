"use strict";
// This file generates images from the story text
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageGenerator = void 0;
class ImageGenerator {
    constructor() { }
    async call(context, client, end, verbose) {
        // This method returns the URL of an image inspired by the story
        const summary = await this.summarizer(context, client, end);
        if (verbose) {
            console.log(`\nSummary: ${summary}\n\n`);
        }
        const imageUrl = await this.drawer(context, client, end);
        let image_gen_dict = { 'summary': summary, 'image_url': imageUrl, 'end': end };
        return image_gen_dict;
    }
    async summarizer(context, client, end) {
        // This method summarizes the story
        let message;
        if (end) {
            message = `This is an interactive story for which the reader has already taken some choices:\n${context}\nPlease, summarize the text in the story in a minimum of 5 lines and a maximum of 10.`;
        }
        else {
            message = `This is the start of an interactive story for which the reader has not taken any choice:\n${context}\nPlease, summarize the text in the story in a minimum of 5 lines and a maximum of 10.`;
        }
        const completion = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: message }
            ]
        });
        return String(completion.choices[0].message.content);
    }
    async drawer(context, client, end) {
        let message;
        if (end) {
            message = `This is an interactive story for which the user has taken some choices:\n${context}\nPlease, generate an image that represents this story and do not include any text in it.`;
        }
        else {
            message = `This is the start of an interactive story:\n${context}\nPlease, generate an image that represents this story and do not include any text in it.`;
        }
        const response = await client.images.generate({
            model: "dall-e-3",
            prompt: message,
            size: "1024x1024",
            quality: "standard",
            n: 1,
        });
        const imageUrl = response.data[0].url;
        return imageUrl;
    }
}
exports.ImageGenerator = ImageGenerator;
exports.default = ImageGenerator;
