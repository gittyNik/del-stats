function generateRandomState() {
  let randomString = '';
  const randomNumber = Math.floor(Math.random() * 10);

  for (let i = 0; i < 20 + randomNumber; i++) {
    randomString += String.fromCharCode(33 + Math.floor(Math.random() * 94));
  }

  return randomString;
}

function base64URLEncode(str) {
  return str.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

let verifier = base64URLEncode(crypto.randomBytes(32));

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest();
}

export const challenge = base64URLEncode(sha256(verifier));

export default generateRandomState;
