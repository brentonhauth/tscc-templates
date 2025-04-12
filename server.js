/*
 * https://docs.google.com/document/d/17SLqUY08QNJRb1E_A2a1lDmrce8NI1-DB9XOD453yW4/edit?ts=5ea9db52 
 */
const fs = require('fs');
const cp = require('child_process');
const app = require('express')();

let Index = "";

let templateNames = [];

const uri = 'https://secure.e-registernow.com/M3474/images/';


/** @param {string} path */
const buildf = path => new Promise((resolve, reject) => {
  cp.exec(`./mjml ./src${path}.mjml` +
  ` --config.minify` +
  ` -o builds${path}.html`,
  (e, o, _) => e ? reject(e) : resolve(o));
});

/** @param {string} path */
const minifyf = path => {
  path = `${__dirname}/builds${path}.html`;
  let data = fs.readFileSync(path).toString();
  data = data.replace(/\.\.\/img\//g, uri);
  data = data.replace(/( ){2,}/g, ''); 
  fs.writeFileSync(path, data);
};


app.get('/', (_, res) => res.send(Index));

app.get(/\.(jpe?g|png|gif)$/i, (req, res) => res.sendFile(`${__dirname}${req.path}`));

app.get('/build/*', (req, res, next) => {
  var [_, path] = req.path.split(/\/build/);

  buildf(path).then(() => {
    res.redirect(path);
  }).catch(next);
});

app.get('/full/*', (req, res, next) => {
  var [_, path] = req.path.split(/\/full/);

  buildf(path).then(() => {
    minifyf(path);
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
      <td><a href="/full/${f}">
        <button>Minify</button>
      </a></td>
    </tr>`;
    templateNames.push(`/${f}`);
  }

  Index = `<div style="text-align:center">
    <table style="margin-right:auto;margin-left:auto">${Index}</table>
  </div>`;

  app.listen(8080, () => {
    console.log('\n\x1b[33m> listening on http://localhost:8080/\x1b[0m');
  });
});

