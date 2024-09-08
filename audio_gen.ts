import * as path from 'path';
import * as fs from 'fs';

export class AudioGen {
    voices : Record<string, any>;

    constructor()
    {this.voices = {
        'Horror' : 'onyx',
        'Suspense' : 'onyx',
        'Crime' : 'onyx',
        'Drama' : 'nova',
        'Young Adult' : 'shimmer',
        'Fantasy' : 'fable',
        'SciFi' : 'fable'
    }}

    async call(context : string , genre : string , client : any , n : number , verbose : boolean): Promise<string>
    {
        let voice = this.voices[genre]
        if (verbose){
            console.log(`\nGiven genre: ${genre} | Selected Voice: ${voice}\n\n`);
        }
        let pathString ='speech' + n.toString() + '.mp3';
        let speech_file_path = path.join(__dirname, pathString)
        const response = await client.audio.speech.create({
            model: "tts-1",
            voice: voice,
            input: context,
          });
      
        const buffer = Buffer.from(await response.arrayBuffer());
        fs.writeFileSync(speech_file_path, buffer);
        if (verbose){
            console.log(`\nSaved ${n} speech to ${speech_file_path}\n\n`);
        }

        return speech_file_path
    }
}

    