import {
  getContentType,
  jidDecode,
  downloadMediaMessage,
  downloadContentFromMessage,
  generateWAMessage,
  areJidsSameUser,
  generateForwardMessageContent,
  proto
} from "@whiskeysockets/baileys";

import { fileTypeFromBuffer } from "file-type";
import fs from "fs";
import path from "path";
import PhoneNumber from "awesome-phonenumber";
import config from "../config.cjs";
import { imageToWebp, videoToWebp, writeExifImg, writeExifVid } from "../lib/exif.cjs";
import { getBuffer, getSizeMedia } from "../lib/myfunc.cjs";

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

/* ===================== BASIC ===================== */

function decodeJid(jid) {
  const { user, server } = jidDecode(jid) || {};
  return user && server ? `${user}@${server}` : jid;
}

const downloadMedia = async (message) => {
  let type = Object.keys(message)[0];
  let m = message[type];

  if (type === "viewOnceMessageV2") {
    m = message.viewOnceMessageV2.message;
    type = Object.keys(m)[0];
    m = m[type];
  }

  const stream = await downloadContentFromMessage(
    m,
    type.replace("Message", "")
  );

  let buffer = Buffer.from([]);
  for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
  return buffer;
};

/* ===================== SERIALIZER ===================== */

function serialize(m, sock, logger = console) {
  if (!m) return m;

  /* ---------- DOWNLOAD ---------- */
  async function downloadFile(m) {
    try {
      return await downloadMediaMessage(
        m,
        "buffer",
        {},
        { logger, reuploadRequest: sock.updateMediaMessage }
      );
    } catch {
      return null;
    }
  }

  /* ---------- REACT ---------- */
  async function React(emoji) {
    await sock.sendMessage(m.from, {
      react: { text: emoji, key: m.key }
    });
  }

  /* ---------- BASIC META ---------- */
  if (m.key) {
    m.id = m.key.id;
    m.isSelf = m.key.fromMe;
    m.from = decodeJid(m.key.remoteJid);
    m.isGroup = m.from.endsWith("@g.us");
    m.sender = m.isGroup
      ? decodeJid(m.key.participant)
      : m.isSelf
      ? decodeJid(sock.user.id)
      : m.from;
  }

  /* ---------- MESSAGE TYPE ---------- */
  if (m.message) {
    m.type = getContentType(m.message);

    if (m.type === "ephemeralMessage") {
      m.message = m.message.ephemeralMessage.message;
      m.type = getContentType(m.message);
    }

    if (m.type === "viewOnceMessageV2") {
      m.message = m.message.viewOnceMessageV2.message;
      m.type = getContentType(m.message);
    }

    const quoted = m.message[m.type]?.contextInfo;

    try {
      if (quoted?.quotedMessage) {
        m.quoted = {
          stanzaId: quoted.stanzaId,
          participant: decodeJid(quoted.participant),
          message: quoted.quotedMessage
        };

        m.quoted.mtype = Object.keys(m.quoted.message)[0];
        m.quoted.text =
          m.quoted.message[m.quoted.mtype]?.text ||
          m.quoted.message[m.quoted.mtype]?.caption ||
          "";

        m.quoted.key = {
          id: m.quoted.stanzaId,
          fromMe: m.quoted.participant === decodeJid(sock.user.id),
          remoteJid: m.from
        };

        m.quoted.download = () => downloadMedia(m.quoted.message);
      } else m.quoted = null;
    } catch {
      m.quoted = null;
    }

    m.body =
      m.message.conversation ||
      m.message[m.type]?.text ||
      m.message[m.type]?.caption ||
      "";

    m.reply = (text) =>
      sock.sendMessage(m.from, { text }, { quoted: m });

    m.download = () => downloadMedia(m.message);
    m.downloadFile = () => downloadFile(m);
    m.React = (emoji) => React(emoji);
  }

  /* ---------- HELPERS ---------- */

  sock.sendContact = async (jid, kon, quoted = "", opts = {}) => {
    const list = kon.map((i) => ({
      displayName: config.OWNER_NAME,
      vcard: `BEGIN:VCARD
VERSION:3.0
FN:${config.OWNER_NAME}
TEL;waid=${i}:${i}
END:VCARD`
    }));

    return sock.sendMessage(
      jid,
      { contacts: { displayName: "Contacts", contacts: list }, ...opts },
      { quoted }
    );
  };

  sock.sendImageAsSticker = async (jid, input, quoted, options = {}) => {
    const buff = Buffer.isBuffer(input)
      ? input
      : /^https?:\/\//.test(input)
      ? await getBuffer(input)
      : fs.readFileSync(input);

    const sticker = options.packname
      ? await writeExifImg(buff, options)
      : await imageToWebp(buff);

    return sock.sendMessage(jid, { sticker }, { quoted });
  };

  sock.sendVideoAsSticker = async (jid, input, quoted, options = {}) => {
    const buff = Buffer.isBuffer(input)
      ? input
      : /^https?:\/\//.test(input)
      ? await getBuffer(input)
      : fs.readFileSync(input);

    const sticker = options.packname
      ? await writeExifVid(buff, options)
      : await videoToWebp(buff);

    return sock.sendMessage(jid, { sticker }, { quoted });
  };

  sock.copyNForward = async (jid, message, force = false, options = {}) => {
    const content = await generateForwardMessageContent(message, force);
    const ctype = Object.keys(content)[0];

    const waMsg = await generateWAMessage(jid, content[ctype], options);
    await sock.relayMessage(jid, waMsg.message, {
      messageId: waMsg.key.id
    });

    return waMsg;
  };

  m.copyNForward = (jid = m.from, force = false, options = {}) =>
    sock.copyNForward(jid, m, force, options);

  return m;
}

export { decodeJid, serialize };
