import crypto from "crypto"

function getKey(): Buffer {
  const raw = process.env.APP_ENCRYPTION_KEY
  if (!raw) {
    throw new Error("APP_ENCRYPTION_KEY não configurada.")
  }
  const key = Buffer.from(raw, "base64")
  if (key.length !== 32) {
    throw new Error("APP_ENCRYPTION_KEY deve ser base64 de 32 bytes.")
  }
  return key
}

export function encryptSecret(plainText: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString("base64")}.${tag.toString("base64")}.${encrypted.toString("base64")}`
}

export function decryptSecret(cipherText: string): string {
  const key = getKey()
  const parts = cipherText.split(".")
  if (parts.length !== 3) {
    throw new Error("Ciphertext inválido.")
  }
  const iv = Buffer.from(parts[0]!, "base64")
  const tag = Buffer.from(parts[1]!, "base64")
  const data = Buffer.from(parts[2]!, "base64")
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv)
  decipher.setAuthTag(tag)
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()])
  return decrypted.toString("utf8")
}

