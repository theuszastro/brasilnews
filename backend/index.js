const { writeFile } = require('fs/promises');

const axios = require('axios');

(async () => {
    const buffer = [];

    for await (let i of Array.from({ length: 112 }, (_, i) => i + 1)) {
        const { data } = await axios({
            method: 'get',
            url: `https://vod-rbs-rs-01.video.globo.com/j/eyJhbGciOiJSUzUxMiIsImtpZCI6IjEiLCJ0eXAiOiJKV1QifQ.eyJjb3VudHJ5X2NvZGUiOiJCUiIsImRvbWFpbiI6InZvZC1yYnMtcnMtMDEudmlkZW8uZ2xvYm8uY29tIiwiZXhwIjoxNjkzNzU0NDI3LCJpYXQiOjE2OTM3NTI0MTMsImlzcyI6InBsYXliYWNrLWFwaS1wcm9kLWdjcCIsIm93bmVyIjoiIiwicGF0aCI6Ii9yMjQwXzcyMC92MC8zMC8xOS8yMy8xMTkxNDY2OF8yMzMwMTZmYTFmNWFhM2ZiYWI2NzYyZDViYjM0NDg3MGRkZGQ0MTE5LzExOTE0NjY4LXFwTUFSQS1tYW5pZmVzdC5pc20vMTE5MTQ2NjgubTN1OCJ9.Mf-vg_gdSSgaXl_ZbHX0ALYN2oaJdoNcWSTZIddn_hP4tDJ2bx6vcHQmoP3XPpfeT7KkgqZNaeo01uIxjPxmNUfrRR-3ALZPZDJGrvpF2-3YQTZZMxlK1ph56K7Hq-WhYjCYgPXlrLkI9MaVOnrxc67-AdJMkOjsnBwTzqGqMQBKB4lOqdbxTmQTOZARQDjihMtgjkM0C7QfHwuqjxa_F7i5uqO5iwxR3LqI-0gQeZMtpTuDjgLkIHZ1wds7mSCzKCAtnghpEzfoKk8N9lpvN9Fr7EBMU4RztwGB1xs8xb5pA1_JIuhLfWP04BoNpBqdEE3ht9aG8r-_EjrLFPC69w/r240_720/v0/30/19/23/11914668_233016fa1f5aa3fbab6762d5bb344870dddd4119/11914668-qpMARA-manifest.ism/11914668-qpMARA-manifest-audio_por=128004-video_por=751000-${i}.ts`,
            responseType: 'arraybuffer',
        });

        console.log(i, typeof data);

        buffer.push(Buffer.from(data));
    }

    await writeFile('teste.mp4', Buffer.from(buffer));
})();
// MP2T;
