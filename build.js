const showdown = require('showdown');

const converter = new showdown.Converter();
const text = `# hello, markdown how are you!

<canvas id="one"></canvas>

This is one paragraph.
Part of the same.

Here's another`;

const html = converter.makeHtml(text);

console.log(html);