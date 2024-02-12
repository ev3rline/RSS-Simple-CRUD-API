import http from 'node:http';

import dotenv from 'dotenv';

import { writeFile } from './utils/fileOperations';
import { launchRouter } from './utils/router';

dotenv.config();

const server = http.createServer();
const MAIN_PORT  = Number(process.env.MAIN_PORT) || 4000;

const modeArgs = process.argv.find(item => item.startsWith('--mode'));
const mode = modeArgs?.slice(7);

const workers: any[] = [];

try {
    if (mode !== 'multi') {
        server.listen(MAIN_PORT, async () => {
            await writeFile('[]');
            console.log(`Server ${process.pid} listening on http://localhost:${MAIN_PORT}`);
        });

        server.on('request', async (req, res) => {
            launchRouter(req, res);
        });

        process.on('SIGINT', async () => {
            await writeFile('[]');
            process.exit();
        });
    } else {
        server.listen(MAIN_PORT, async () => {
            await writeFile('[]');
            console.log(`Worker ${process.pid} listening on http://localhost:${MAIN_PORT}`);
        });
        server.on('request', async (req, res) => {
            await launchRouter(req, res);
        });

        process.on('message', (message: any) => {
            const postData = JSON.stringify(message.data.data);
            const options = {
                hostname: 'localhost',
                port: MAIN_PORT,
                path: message.data.url,
                method: message.data.method,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk.toString();
                });
                res.on('end', () => {});
            });

            req.on('error', (error) => {
                console.error(error);
            });

            message.data.data && req.write(message.data.data);
            req.end();
        });
    }
} catch {
    writeFile('[]');
}
