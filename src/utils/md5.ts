const S = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
];

const K = Array.from({ length: 64 }, (_, index) => Math.floor(Math.abs(Math.sin(index + 1)) * 0x100000000) >>> 0);

function leftRotate(value: number, shift: number) {
  return ((value << shift) | (value >>> (32 - shift))) >>> 0;
}

function toUtf8Bytes(input: string) {
  return new TextEncoder().encode(input);
}

function toHexWord(word: number) {
  let hex = "";
  for (let index = 0; index < 4; index += 1) {
    hex += ((word >>> (index * 8)) & 0xff).toString(16).padStart(2, "0");
  }
  return hex;
}

export function md5(input: string) {
  const bytes = toUtf8Bytes(input);
  const originalBitLength = bytes.length * 8;

  const paddedLength = (((bytes.length + 9 + 63) >> 6) << 6);
  const buffer = new Uint8Array(paddedLength);
  buffer.set(bytes);
  buffer[bytes.length] = 0x80;

  const bitLengthLow = originalBitLength >>> 0;
  const bitLengthHigh = Math.floor(originalBitLength / 0x100000000) >>> 0;
  const lengthOffset = paddedLength - 8;

  buffer[lengthOffset] = bitLengthLow & 0xff;
  buffer[lengthOffset + 1] = (bitLengthLow >>> 8) & 0xff;
  buffer[lengthOffset + 2] = (bitLengthLow >>> 16) & 0xff;
  buffer[lengthOffset + 3] = (bitLengthLow >>> 24) & 0xff;
  buffer[lengthOffset + 4] = bitLengthHigh & 0xff;
  buffer[lengthOffset + 5] = (bitLengthHigh >>> 8) & 0xff;
  buffer[lengthOffset + 6] = (bitLengthHigh >>> 16) & 0xff;
  buffer[lengthOffset + 7] = (bitLengthHigh >>> 24) & 0xff;

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  for (let chunkOffset = 0; chunkOffset < buffer.length; chunkOffset += 64) {
    const words = new Uint32Array(16);
    for (let index = 0; index < 16; index += 1) {
      const offset = chunkOffset + index * 4;
      words[index] =
        buffer[offset] |
        (buffer[offset + 1] << 8) |
        (buffer[offset + 2] << 16) |
        (buffer[offset + 3] << 24);
    }

    let a = a0;
    let b = b0;
    let c = c0;
    let d = d0;

    for (let index = 0; index < 64; index += 1) {
      let f: number;
      let g: number;

      if (index < 16) {
        f = (b & c) | (~b & d);
        g = index;
      } else if (index < 32) {
        f = (d & b) | (~d & c);
        g = (5 * index + 1) % 16;
      } else if (index < 48) {
        f = b ^ c ^ d;
        g = (3 * index + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * index) % 16;
      }

      const temp = d;
      d = c;
      c = b;
      b = (b + leftRotate((a + f + K[index] + words[g]) >>> 0, S[index])) >>> 0;
      a = temp;
    }

    a0 = (a0 + a) >>> 0;
    b0 = (b0 + b) >>> 0;
    c0 = (c0 + c) >>> 0;
    d0 = (d0 + d) >>> 0;
  }

  return `${toHexWord(a0)}${toHexWord(b0)}${toHexWord(c0)}${toHexWord(d0)}`;
}

export default md5;
