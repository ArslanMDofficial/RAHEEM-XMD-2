
// config.js
const fs = require("fs");
require("dotenv").config();

const config = {
  SESSION_ID: process.env.SESSION_ID || "ARSLAN-MD~eyJub2lzZUtleSI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoib0RybHdSKzlZc1R5Z0R6U1dKRExUZkExRmN0Z2JicEVPTFVQTzJGQmhWND0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiMXVFZVF3bXBnblNVWVdTNWczcTI4M1VLYUx1L3Q5bTN2QURMSlY3TWJsOD0ifX0sInBhaXJpbmdFcGhlbWVyYWxLZXlQYWlyIjp7InByaXZhdGUiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJBSlVFMVAzUjgxcENhK1dCTUVaZVJTakx4MkNITXlNT0s3bGQ0VHNMRkVRPSJ9LCJwdWJsaWMiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJvcEI0WU5xSG84NGxjc3ZKU0Jad0VhUVVsTTZMZjdjbEowRDB5YjQwT0FjPSJ9fSwic2lnbmVkSWRlbnRpdHlLZXkiOnsicHJpdmF0ZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6ImFBSjdoZ0xLODU4WFg1T3ZyT29RWkMwZ3QrZVM0eFVkSXlHZGlENnQ3VXc9In0sInB1YmxpYyI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6InZPcWUzNkVqVVlsbW1SUkQydDlpTVBhQnREVEVmbFhteElVUDk4eGFWRU09In19LCJzaWduZWRQcmVLZXkiOnsia2V5UGFpciI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiMEc0emNOTHFSMU5rcU93YXBSTXgwWEFYU0Q1WWthQktyd1ZrOUo0TDNuND0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiVVhNUVZwVnBnUEtCK3gzTmRsS1dOOVRUQzVaNnpFNkYvVmQ2RmkzbU8yRT0ifX0sInNpZ25hdHVyZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6Im82UUN1a2MyYjNsQTVHeTN2QmRhaDExMkxEd3JVSmdKOWZWWTA4dVpvTm1VRkxNUUduVVdZTE04TTNRU1Z3TnVMemt2dHk2clJHeVB1WlFtWG0rR2pRPT0ifSwia2V5SWQiOjF9LCJyZWdpc3RyYXRpb25JZCI6ODcsImFkdlNlY3JldEtleSI6IkI3enRCQlRYQWpnc1FPWjdGOUU4dkJhQmtRSER3YnpmZy9ONFN2MHZ0RnM9IiwicHJvY2Vzc2VkSGlzdG9yeU1lc3NhZ2VzIjpbXSwibmV4dFByZUtleUlkIjo4MTMsImZpcnN0VW51cGxvYWRlZFByZUtleUlkIjo4MTMsImFjY291bnRTeW5jQ291bnRlciI6MCwiYWNjb3VudFNldHRpbmdzIjp7InVuYXJjaGl2ZUNoYXRzIjpmYWxzZX0sInJlZ2lzdGVyZWQiOnRydWUsInBhaXJpbmdDb2RlIjoiWVVQUkFERVYiLCJtZSI6eyJpZCI6IjkyMzIzNzA0NTkxOTo5NkBzLndoYXRzYXBwLm5ldCIsIm5hbWUiOiJBcnNsYW5NRCBPZmZpY2lhbCIsImxpZCI6IjEzMTA2NTc0MjEyNzIzNDo5NkBsaWQifSwiYWNjb3VudCI6eyJkZXRhaWxzIjoiQ0pLU3FLd0dFS0wxMWNvR0dBRWdBQ2dBIiwiYWNjb3VudFNpZ25hdHVyZUtleSI6ImwvYkY0c3cxUHVxQjc2a0JpVk8xb3ptRWo3WjBGUm1yMXZFV3ZLLzFaMjg9IiwiYWNjb3VudFNpZ25hdHVyZSI6InhYL3A4RHJkTi9EdEZrS3dSbWNNT1AyeUVEZDhEaENkUExsdVQ4SG1BUE14VW1JWldNdWw1QVVhV1BvTFRZUEhOdGZhMTQwMU9ON2REV2ZlTzI4OURRPT0iLCJkZXZpY2VTaWduYXR1cmUiOiJvbnlQVXRYVkIrRWZYckJHMENwVmJiYUhTNDdtQkYxY3QzVnNIZithY2hCZFVEV0FzTWxmdnVMZFpTVS80cThNdjZJRndwdnc1V3hGWVo5ODhwbDVodz09In0sInNpZ25hbElkZW50aXRpZXMiOlt7ImlkZW50aWZpZXIiOnsibmFtZSI6IjkyMzIzNzA0NTkxOTo5NkBzLndoYXRzYXBwLm5ldCIsImRldmljZUlkIjowfSwiaWRlbnRpZmllcktleSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IkJaZjJ4ZUxNTlQ3cWdlK3BBWWxUdGFNNWhJKzJkQlVacTlieEZyeXY5V2R2In19XSwicGxhdGZvcm0iOiJzbWJhIiwicm91dGluZ0luZm8iOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJDQklJQWdnTiJ9LCJsYXN0QWNjb3VudFN5bmNUaW1lc3RhbXAiOjE3NjcyMDk2NDgsImxhc3RQcm9wSGFzaCI6IjFLNGhINCIsIm15QXBwU3RhdGVLZXlJZCI6IkFBQUFBQStZIn0=",
  PREFIX: process.env.PREFIX || '+',
  AUTO_STATUS_SEEN: process.env.AUTO_STATUS_SEEN !== undefined ? process.env.AUTO_STATUS_SEEN === 'true' : true, 
  AUTO_STATUS_REPLY: process.env.AUTO_STATUS_REPLY !== undefined ? process.env.AUTO_STATUS_REPLY === 'true' : true,
  STATUS_READ_MSG: process.env.STATUS_READ_MSG || '',
  AUTO_DL: process.env.AUTO_DL !== undefined ? process.env.AUTO_DL === 'true' : false,
  AUTO_READ: process.env.AUTO_READ !== undefined ? process.env.AUTO_READ === 'true' : false,
  AUTO_TYPING: process.env.AUTO_TYPING !== undefined ? process.env.AUTO_TYPING === 'true' : false,
  AUTO_RECORDING: process.env.AUTO_RECORDING !== undefined ? process.env.AUTO_RECORDING === 'true' : false,
  ALWAYS_ONLINE: process.env.ALWAYS_ONLINE !== undefined ? process.env.ALWAYS_ONLINE === 'true' : false,
  AUTO_REACT: process.env.AUTO_REACT !== undefined ? process.env.AUTO_REACT === 'true' : false,
   /*auto block only for 212 */
  AUTO_BLOCK: process.env.AUTO_BLOCK !== undefined ? process.env.AUTO_BLOCK === 'true' : true,
  
  
  REJECT_CALL: process.env.REJECT_CALL !== undefined ? process.env.REJECT_CALL === 'true' : false, 
  NOT_ALLOW: process.env.NOT_ALLOW !== undefined ? process.env.NOT_ALLOW === 'true' : true,
  MODE: process.env.MODE || "public",
  BOT_NAME: process.env.BOT_NAME || "RAHEEM-XMD-2",
  MENU_IMAGE: process.env.MENU_IMAGE || "https://files.catbox.moe/vgb4cw.jpg",
  DESCRIPTION: process.env.DESCRIPTION || "WELCOME TO RAHEEM-XMD-2",
  OWNER_NAME: process.env.OWNER_NAME || "RAHEEM-CM",
  OWNER_NUMBER: process.env.OWNER_NUMBER || "255763111390",
  GEMINI_KEY: process.env.GEMINI_KEY || "AIzaSyCUPaxfIdZawsKZKqCqJcC-GWiQPCXKTDc",
  WELCOME: process.env.WELCOME !== undefined ? process.env.WELCOME === 'true' : false, 
};


module.exports = config;


