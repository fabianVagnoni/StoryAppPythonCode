"use strict";
// This file generates a story
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const openai = __importStar(require("openai"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const image_gen_1 = require("./image_gen");
const audio_gen_1 = require("./audio_gen");
const client = new openai.OpenAI();
// Parameters
let story = {};
const time = 1000;
const genre = 'Horror';
const n_choices = 4;
const temp = 0.69;
const max_tks = 300;
let index = 0;
const samples = 3;
// Main class
class StoryLoop {
    constructor(max_tks, genre, temp, n_choices, samples, verbose = false) {
        this.story = {};
        this.genre = genre;
        this.max_tks = max_tks;
        this.temp = temp;
        this.index = 0;
        this.n_choices = n_choices;
        this.samples = samples;
        this.choices = [];
        this.story_text = [];
        this.image_generator = new image_gen_1.ImageGenerator();
        this.audio_gen = new audio_gen_1.AudioGen();
        this.audio_paths = [];
        this.verbose = verbose;
    }
    async call() {
        let message = `Write the beginning of an interactive story of genre ${this.genre}. Give the reader ${this.n_choices} possible actions to take to continue the story. In your response only provide a RFC8259 compliant JSON response following this format without deviation: 'storyTitle' for a meaningful and impactive story's title , 'storyText' for the narrative introduction, 'options' as an array of ${this.n_choices} distinct choices for the user, and 'end' as a boolean indicating whether the story is concluded. The JSON should be well-formed and should NOT be enveloped with three ''' on each end and NOT include the word json NOR any ''' and it should be a SINGLE long string with NO escape characters. Please, limit your response to NO MORE THAN ${this.max_tks - 50} tokens. \n\nStart the story:`;
        for (let i = 0; i < this.samples; i++) {
            if (this.verbose) {
                console.log(`Iteration: ${i}\n`);
            }
            const jsonString = await this.gpt_call(message);
            message = this.update_data(jsonString, i);
            //if (i==0) {
            //const cn = await this.generate_image(i);
            //const filePath = path.join(__dirname, 'initial_image.json');
            //fs.writeFileSync(filePath, JSON.stringify(cn, null, 2), 'utf-8');
            //}
            let audioPath = await this.generate_audio(i);
            this.audio_paths.push(audioPath);
        }
        const cn = await this.generate_image(1);
        const filePathIm = path.join(__dirname, 'final_image.json');
        fs.writeFileSync(filePathIm, JSON.stringify(cn, null, 2), 'utf-8');
        let audioPath = await this.generate_audio(this.samples);
        this.audio_paths.push(audioPath);
        const jsonString = JSON.stringify(this.story, null, 2);
        const filePath = path.join(__dirname, 'story.json');
        fs.writeFileSync(filePath, jsonString, 'utf-8');
        return this.story_text;
    }
    async gpt_call(message) {
        const completion = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: message }
            ],
            temperature: this.temp,
            max_tokens: this.max_tks,
        });
        const jsonString = String(completion.choices[0].message.content);
        if (this.verbose) {
            console.log('Returned response by GPT\n');
            console.log(`${jsonString}\n\n\n`);
        }
        return jsonString;
    }
    update_data(jsonString, i) {
        this.story[this.index] = JSON.parse(jsonString);
        this.index++;
        const chosen_option = Math.round(Math.random() * (this.n_choices - 1));
        this.choices.push(chosen_option);
        if (this.verbose) {
            console.log('Story Text\n');
            console.log(this.story[this.index - 1].storyText);
            if (i < this.samples - 1) {
                console.log(`${this.story[this.index - 1].options}\n`);
                console.log(`User chose: ${this.story[this.index - 1].options[chosen_option]}\n\n\n`);
            }
            else {
                console.log('The End.');
            }
        }
        if (i < this.samples - 1) {
            this.story_text.push(this.story[this.index - 1].storyText, this.story[this.index - 1].options[chosen_option]);
        }
        else {
            this.story_text.push(this.story[this.index - 1].storyText);
        }
        if (i < this.samples - 2) {
            return `Consider an interactive story that starts by '${this.story_text.join(' ')}'. It is an story for which the reader has chosen already some alternatives. Please, continue the story and give the reader ${this.n_choices} possible actions to take to continue the story. In your response only provide a RFC8259 compliant JSON response following this format without deviation: 'storyText' for the narrative introduction, 'options' as an array of ${this.n_choices} distinct choices for the user, and 'end' as a boolean indicating whether the story is concluded. The JSON should be well-formed and should NOT be enveloped with three ''' on each end and NOT include the word json NOR any ''' and it should be a SINGLE long string with NO escape characters. Ensure that the quotation marks are well placed for the string to be convertible into a JSON file directly. Please, limit your response to NO MORE THAN ${this.max_tks - 50} tokens.`;
        }
        else {
            if (this.verbose && i === this.samples - 2) {
                console.log('End of the story is being constructed');
            }
            return `Consider an interactive story that starts by '${this.story_text.join(' ')}'. It is an interactive story for which the reader has chosen already some alternatives. Please, write a definitive ending to the story in accordance to all the previous events and include no new options. In your response only provide a RFC8259 compliant JSON response following this format without deviation: 'storyText' for the narrative introduction, 'options' as an empty array, and 'end' as a boolean indicating whether the story is concluded, in this case yes. The JSON should be well-formed and should NOT be enveloped with three ''' on each end and NOT include the word json NOR any ''' and it should be a SINGLE long string with NO escape characters. Ensure that the quotation marks are well placed for the string to be convertible into a JSON file directly. Please, limit your response to NO MORE THAN ${this.max_tks - 50} tokens.`;
        }
    }
    async generate_image(i) {
        let end;
        if (i == 0) {
            end = false;
        }
        else {
            end = true;
        }
        const context = this.story_text.join('');
        const imageUrl = await this.image_generator.call(context, client, end, this.verbose);
        if (this.verbose) {
            console.log(`\nImage URL: ${imageUrl}\n\n`);
        }
        return imageUrl;
    }
    async generate_audio(i) {
        const context = this.story_text.join('');
        const audioPath = await this.audio_gen.call(context, this.genre, client, i, this.verbose);
        return audioPath;
    }
}
const sg = new StoryLoop(max_tks, genre, temp, n_choices, samples, true);
sg.call().then((st) => {
    console.log(`This is the story text: \n${st}`);
});
