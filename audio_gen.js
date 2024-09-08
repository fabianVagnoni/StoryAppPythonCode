"use strict";
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
exports.AudioGen = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
class AudioGen {
    constructor() {
        this.voices = {
            'Horror': 'onyx',
            'Suspense': 'onyx',
            'Crime': 'onyx',
            'Drama': 'nova',
            'Young Adult': 'shimmer',
            'Fantasy': 'fable',
            'SciFi': 'fable'
        };
    }
    async call(context, genre, client, n, verbose) {
        let voice = this.voices[genre];
        if (verbose) {
            console.log(`\nGiven genre: ${genre} | Selected Voice: ${voice}\n\n`);
        }
        let pathString = 'speech' + n.toString() + '.mp3';
        let speech_file_path = path.join(__dirname, pathString);
        const response = await client.audio.speech.create({
            model: "tts-1",
            voice: voice,
            input: context,
        });
        const buffer = Buffer.from(await response.arrayBuffer());
        fs.writeFileSync(speech_file_path, buffer);
        if (verbose) {
            console.log(`\nSaved ${n} speech to ${speech_file_path}\n\n`);
        }
        return speech_file_path;
    }
}
exports.AudioGen = AudioGen;
