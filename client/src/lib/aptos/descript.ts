import * as forge from "node-forge";

interface IDecryptRequest {
  cipherText: string;
  password: string;
  saltB64: string;
  ivB64: string;
}

interface IDecryptResponse {
  prKey: string;
}
export const Decrypt = (params: IDecryptRequest): IDecryptResponse => {
  const { cipherText, password, saltB64, ivB64 } = params;

  const salt = forge.util.decode64(saltB64);
  const iv = forge.util.decode64(ivB64);
  const key = forge.pkcs5.pbkdf2(password, salt, 10000, 32);

  const decipher = forge.cipher.createDecipher("AES-CBC", key);

  decipher.start({ iv: iv });
  decipher.update(forge.util.createBuffer(forge.util.decode64(cipherText)));

  const success = decipher.finish();

  if (!success) throw new Error("Failed to decrypt private key");

  return {
    prKey: decipher.output.toString(),
  };
};
