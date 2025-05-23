/*
 * https://docs.google.com/document/d/17SLqUY08QNJRb1E_A2a1lDmrce8NI1-DB9XOD453yW4/edit?ts=5ea9db52 
 */
const fs = require('fs');
const cp = require('child_process');
const app = require('express')();

let Index = '';
const templateNames = [];
const uri = 'https://secure.e-registernow.com/M3474/images/';


/** @param {string} path */
const buildf = path => new Promise((resolve, reject) => {
  cp.exec(`./mjml ./src${path}.mjml` +
  ` --config.minify` +
  ` -o builds${path}.html`,
  (err, out, _) => err ? reject(err) : resolve(out));
});


app.get('/', (_, res) => res.send(Index));

app.get(/\.(jpe?g|png|gif|ico)$/i, (req, res) => {
  res.sendFile(`${__dirname}${req.path}`);
});

app.get('/all', (_, res, next) => {
  const promises = [];

  for (let name of templateNames) {
    promises.push(buildf(name).catch(err => {
      console.error(err);
    }));
  }

  Promise.all(promises).then(() => {
    res.redirect('/');
  }).catch(next);
});

app.get('/build/*', (req, res, next) => {
  const [, path] = req.path.split(/\/build/);

  buildf(path).then(() => {
    res.redirect(path);
  }).catch(next);
});

// app.get('/auto/*', (req, res, next) => {
//   var [_, path] = req.path.split(/\/auto/);
//   buildf(path).then(() => {
//     res.sendFile(`${__dirname}/builds${req.path}.html`);
//   }).catch(next);
// });

app.get(templateNames, (req, res) => {
  res.sendFile(`${__dirname}/builds${req.path}.html`);
});



app.use((_, res) => res.redirect('/'));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.redirect('/');
});



fs.readdir('./src', (err, files) => {
  if (err) { throw err; }

  for (let file of files) {
    let [f] = file.split(/\.(mjml$)?/i);
    Index += `<tr>
      <td><a href="/${f}">${f}</a></td>
      <td><a href="/build/${f}">
        <button>Build</button>
      </a></td>
    </tr>`;
    templateNames.push(`/${f}`);
  }

  Index = `<div style="text-align:center">
    <table style="margin-right:auto;margin-left:auto">${Index}</table>
    <br /><a href="/all">Build All</a>
  </div>`;

  app.listen(8080, () => {
    console.log('\n\x1b[33m> listening on http://localhost:8080/\x1b[0m');
  });
});

