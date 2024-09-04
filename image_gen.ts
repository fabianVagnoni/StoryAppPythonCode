// This file generates images from the story text

export class ImageGenerator {
    constructor() {}

    async call(context: string, client: any, verbose: boolean): Promise<string> {
        // This method returns the URL of an image inspired by the story
        const summary = await this.summarizer(context, client);
        if (verbose) {
            console.log(`\nSummary: ${summary}\n\n`);
        }
        const imageUrl = await this.drawer(summary, client);
        return imageUrl;
    }

    private async summarizer(context: string, client: any): Promise<string> {
        // This method summarizes the story
        const message = `This is the start of an interactive story for which the reader has already taken some choices:\n${context}\nPlease, summarize the text in the story in a minimum of 5 lines and a maximum of 5.`;
        const completion = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: message }
            ]
        });
        return String(completion.choices[0].message.content);
    }

    private async drawer(context: string, client: any): Promise<string> {
        const message = `This is the summary of an interactive story:\n${context}\nPlease, generate an image that represents this story and do not include any text in it.`;
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

export default ImageGenerator;
