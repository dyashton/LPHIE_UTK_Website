import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 1️⃣ Serve static files from dist at /LPHIE_UTK_Website
app.use('/', express.static(path.join(__dirname, 'dist')));

// 2️⃣ Catch-all route for SPA routing
app.get('*', (req, res) => {
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    } else {
        res.status(404).end();
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});