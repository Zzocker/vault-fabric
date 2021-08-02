import { ICryptoKey } from 'fabric-common';
export class VaultKey implements ICryptoKey {
  getSKI(): string {
    console.log(`VaultKey::getSKI()`);
    throw new Error('implement me');
  }
  getHandle(): string {
    console.log(`VaultKey::getHandle()`);
    throw new Error('implement me');
  }
  isSymmetric(): boolean {
    console.log(`VaultKey::isSymmetric()`);
    throw new Error('implement me');
  }
  isPrivate(): boolean {
    console.log(`VaultKey::isPrivate()`);
    throw new Error('implement me');
  }
  getPublicKey(): ICryptoKey {
    console.log(`VaultKey::getPublicKey()`);
    throw new Error('implement me');
  }
  toBytes(): string {
    console.log(`VaultKey::toBytes()`);
    throw new Error('implement me');
  }
}
