// Canonical snapshot values. Missing = legacy Code 128, unknown != Code 128.
export const formats = Object.freeze({code128:'code128',ean13:'ean13',ean8:'ean8',
  upca:'upca',upce:'upce',code39:'code39',code93:'code93',itf:'interleaved2of5',
  codabar:'rationalizedCodabar',pdf417:'pdf417',data_matrix:'datamatrix',aztec:'azteccode'});
export function barcodeOptions(coupon) {
  const text = coupon.code_value;
  if (typeof text !== 'string' || !text.length) throw new Error('missing_code');
  const format = coupon.code_type === 'qr' ? 'qr' : coupon.barcode_format ?? 'code128';
  const bcid = format === 'qr' ? 'qrcode' : formats[format];
  if (!bcid) throw new Error('unsupported_format');
  const length = {ean13:13,ean8:8,upca:12,upce:8}[format];
  if (length && !new RegExp(`^[0-9]{${length}}$`).test(text)) throw new Error('incomplete_code');
  // bwipp checks the supplied check digit; require it rather than generate one.
  const encoded = format === 'codabar' && /^[0-9.$:/+-]+$/.test(text) ? `A${text}A` : text;
  const twoDimensional = ['qr','pdf417','data_matrix','aztec'].includes(format);
  return {bcid,text:encoded,scale:3,padding:12,...(twoDimensional ? {} : {height:16})};
}
