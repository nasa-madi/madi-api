import fetch from 'node-fetch';
import FormData from 'form-data';
import { createReadStream } from 'fs';

async function sendRequest() {
    const form = new FormData();
    form.append('file', createReadStream('./test_new_year.pdf'));

    const response = await fetch('http://localhost:5001/api/parseDocument?renderFormat=all&applyOcr=yes', {
        method: 'POST',
        body: form,
    });

    const result = await response.json();
    console.log(JSON.stringify(result, null, 2));
}

sendRequest().catch(console.error);
