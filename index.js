import dotenv from 'dotenv';
dotenv.config();

import {
    makeWASocket,
    Browsers,
    fetchLatestBaileysVersion,
    DisconnectReason,
    useMultiFileAuthState,
} from '@whiskeysockets/baileys';
import { Handler, Callupdate, GroupUpdate } from './data/index.js';
import express from 'express';
import pino from 'pino';
import fs from 'fs';
import { File } from 'megajs';
import NodeCache from 'node-cache';
import path from 'path';
import chalk from 'chalk';
import moment from 'moment-timezone';
import axios from 'axios';
import config from './config.cjs';
import pkg from './lib/autoreact.cjs';
const { emojis, doReact } = pkg;
const prefix = process.env.PREFIX || config.PREFIX;
const sessionName = "session";
const app = express();
const orange = chalk.bold.hex("#FFA500");
const lime = chalk.bold.hex("#32CD32");
let useQR = false;
let initialConnection = true;
const PORT = process.env.PORT || 3000;

const MAIN_LOGGER = pino({
    timestamp: () => `,"time":"${new Date().toJSON()}"`
});
const logger = MAIN_LOGGER.child({});
logger.level = "trace";

const msgRetryCounterCache = new NodeCache();

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const sessionDir = path.join(__dirname, 'session');
const credsPath = path.join(sessionDir, 'creds.json');

if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
}
async function downloadSessionData() {
    try {
        if (!config.SESSION_ID) {
            console.log(chalk.yellow('[⚠️] No SESSION_ID - Will use QR/Pairing'));
            return null;
        }

        console.log(chalk.cyan('[🔰] Processing SESSION_ID...'));

        // ✅ QADEER-XD FORMAT
        if (config.SESSION_ID.includes('ARSLAN-MD~')) {
            console.log(chalk.cyan('[🔰] Detected QADEER-XD format session'));
            const base64Data = config.SESSION_ID.split("ARSLAN-MD~")[1];
            if (!base64Data) {
                console.log(chalk.red('[❌] Invalid QADEER-XD format'));
                return null;
            }
            try {
                const sessionData = Buffer.from(base64Data, 'base64');
                fs.writeFileSync(credsPath, sessionData);
                console.log(chalk.green('[✅] ARSLAN-MD session saved!'));
                return JSON.parse(sessionData.toString());
            } catch (e) {
                console.log(chalk.red(`[❌] ARSLAN-MD parse error: ${e.message}`));
                return null;
            }
        }
        // ✅ PLAIN BASE64 FORMAT
        else if (config.SESSION_ID.length > 100 && !config.SESSION_ID.includes('http')) {
            console.log(chalk.cyan('[🔰] Detected direct base64 session'));
            try {
                if (!/^[A-Za-z0-9+/=]+$/.test(config.SESSION_ID)) {
                    console.log(chalk.red('[❌] Invalid base64 format'));
                    return null;
                }
                const sessionData = Buffer.from(config.SESSION_ID, 'base64');
                fs.writeFileSync(credsPath, sessionData);
                console.log(chalk.green('[✅] Base64 session saved!'));
                return JSON.parse(sessionData.toString());
            } catch (e) {
                console.log(chalk.red(`[❌] Base64 parse error: ${e.message}`));
                return null;
            }
        }
        // ✅ DIRECT JSON STRING
        else if (config.SESSION_ID.startsWith('{')) {
            console.log(chalk.cyan('[🔰] Detected direct JSON session'));
            try {
                const sessionData = JSON.parse(config.SESSION_ID);
                fs.writeFileSync(credsPath, JSON.stringify(sessionData));
                console.log(chalk.green('[✅] JSON session saved!'));
                return sessionData;
            } catch (e) {
                console.log(chalk.red(`[❌] JSON parse error: ${e.message}`));
                return null;
            }
        }
        // ✅ MEGA.NZ URL FORMAT
        else if (config.SESSION_ID.includes('mega.nz')) {
            console.log(chalk.cyan('[🔰] Detected MEGA.NZ URL session'));
            try {
                const { default: Mega } = require('megajs');
                const mega = new Mega({});
                const file = await mega.getFileByUrl(config.SESSION_ID);
                const data = await new Promise((resolve, reject) => {
                    file.download((err, data) => {
                        if (err) reject(err);
                        else resolve(data);
                    });
                });
                fs.writeFileSync(credsPath, data);
                console.log(chalk.green('[✅] MEGA session downloaded & saved!'));
                return JSON.parse(data.toString());
            } catch (error) {
                console.log(chalk.red(`[❌] MEGA session error: ${error.message}`));
                console.log(chalk.yellow('[💡] Install megajs: npm install megajs'));
                return null;
            }
        } else {
            console.log(chalk.yellow('[⚠️] Unknown SESSION_ID format'));
            return null;
        }

    } catch (error) {
        console.log(chalk.red(`[❌] Session load error: ${error.message}`));
        return null;
    }
}


async function start() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        const { version, isLatest } = await fetchLatestBaileysVersion();
        console.log(`🤖 RAHEEM-XMD-2 using WA v${version.join('.')}, isLatest: ${isLatest}`);
        
        const Matrix = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: useQR,
            browser: ["RAHEEM-XMD-2", "safari", "3.3"],
            auth: state,
            getMessage: async (key) => {
                if (store) {
                    const msg = await store.loadMessage(key.remoteJid, key.id);
                    return msg.message || undefined;
                }
                return { conversation: " cloid ai whatsapp user bot" };
            }
        });

        Matrix.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                    start();
                }
            } else if (connection === 'open') {
                if (initialConnection) {
                    console.log(chalk.green("Connected Successfully RAHEEM-XMD-2♻️"));
                    Matrix.sendMessage(Matrix.user.id, { 
                        image: { url: "https://files.catbox.moe/vgb4cw.jpg" }, 
                        caption: `╓─────────────────╖
│WELCOME TO RAHEEM-XMD-2 
╙─────────────────╜
*⚠️ Hello there User! 🤖*

════════════════════
♻️ CHANNEL : https://whatsapp.com/channel/0029VbAffhD2ZjChG9DX922r

═══════════════════
*🪀 Your Prefix:* = *${prefix}*
═══════════════════

💬 REPO : https://github.com/Raheem-cm/RAHEEM-XMD-2 

╚══════════════════╝
       © DEV RAHEE-CM`
                    });
                    initialConnection = false;
                } else {
                    console.log(chalk.blue("♻️ Connection reestablished after restart."));
                }
            }
        });

        Matrix.ev.on('creds.update', saveCreds);

        Matrix.ev.on("messages.upsert", async chatUpdate => await Handler(chatUpdate, Matrix, logger));
        Matrix.ev.on("call", async (json) => await Callupdate(json, Matrix));
        Matrix.ev.on("group-participants.update", async (messag) => await GroupUpdate(Matrix, messag));

        if (config.MODE === "public") {
            Matrix.public = true;
        } else if (config.MODE === "private") {
            Matrix.public = false;
        }

        Matrix.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                const mek = chatUpdate.messages[0];
                console.log(mek);
                if (!mek.key.fromMe && config.AUTO_REACT) {
                    console.log(mek);
                    if (mek.message) {
                        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                        await doReact(randomEmoji, mek, Matrix);
                    }
                }
            } catch (err) {
                console.error('Error during auto reaction:', err);
            }
        });
        
        Matrix.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                const mek = chatUpdate.messages[0];
                const fromJid = mek.key.participant || mek.key.remoteJid;
                if (!mek || !mek.message) return;
                if (mek.key.fromMe) return;
                if (mek.message?.protocolMessage || mek.message?.ephemeralMessage || mek.message?.reactionMessage) return; 
                if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_SEEN) {
                    await Matrix.readMessages([mek.key]);
                    
                    if (config.AUTO_STATUS_REPLY) {
                        const customMessage = config.STATUS_READ_MSG || '✅ Auto Status Seen Bot By RAHEEM-XMD-2';
                        await Matrix.sendMessage(fromJid, { text: customMessage }, { quoted: mek });
                    }
                }
            } catch (err) {
                console.error('Error handling messages.upsert event:', err);
            }
        });

    } catch (error) {
        console.error('Critical Error:', error);
        process.exit(1);
    }
}

async function init() {
    if (fs.existsSync(credsPath)) {
        console.log("🔒 Session file found, proceeding without QR code.");
        await start();
    } else {
        const sessionDownloaded = await downloadSessionData();
        if (sessionDownloaded) {
            console.log("🔒 Session downloaded, starting bot.");
            await start();
        } else {
            console.log("No session found or downloaded, QR code will be printed for authentication.");
            useQR = true;
            await start();
        }
    }
}

init();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
  
