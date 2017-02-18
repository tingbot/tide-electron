
export function isValidUTF8(buf){
  return Buffer.compare(new Buffer(buf.toString('utf8'), 'utf8') , buf) === 0
}
