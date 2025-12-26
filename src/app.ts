import express from 'express';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello from Express.js with TypeScript!');
});

app.listen(port, () => {
  console.log(`Express.js app (TypeScript) listening at http://localhost:${port}`);
});