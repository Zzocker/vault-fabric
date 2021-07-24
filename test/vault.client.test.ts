import { assert } from 'chai';
import {
  IVaultClientOptions,
  VaultClient,
  VaultKeyECCurve,
} from '../src/vault.client';
describe('Vault.Client', () => {
  describe('HappyFlow', () => {
    const opts: IVaultClientOptions = {
      endpoint: 'http://localhost:8200',
      token: 'tokenId',
    };
    const client = new VaultClient(opts);
    it('newKey()::p-256', async () => {
      await client.newKey('mock-p-256', VaultKeyECCurve.P256);
    });
    it('pubKey()::p-256', async () => {
      const ecJwk = await client.pubKey('mock-p-256');
      assert.equal(ecJwk.crv, VaultKeyECCurve.P256);
      assert.equal(ecJwk.version, 'v1');
      const re = /[0-9A-Fa-f]{6}/g;
      assert.isTrue(re.test(ecJwk.x));
      assert.isTrue(re.test(ecJwk.y));
    });
    const data: Buffer = Buffer.from('Hello Vault');
    let signature: Buffer;
    it('sign()::p-256', async () => {
      signature = await client.sign('mock-p-256', data, false);
      assert.isNotNull(signature);
    });
    it('verify()::p-256', async () => {
      const valid = await client.verify('mock-p-256', data, signature, false);
      assert.isTrue(valid);
    });
    it('newKey()::p-384', async () => {
      await client.newKey('mock-p-384', VaultKeyECCurve.P384);
    });
    it('pubKey()::p-384', async () => {
      const ecJwk = await client.pubKey('mock-p-384');
      assert.equal(ecJwk.crv, VaultKeyECCurve.P384);
      assert.equal(ecJwk.version, 'v1');
      const re = /[0-9A-Fa-f]{6}/g;
      assert.isTrue(re.test(ecJwk.x));
      assert.isTrue(re.test(ecJwk.y));
    });
    it('sign()::p-384', async () => {
      signature = await client.sign('mock-p-384', data, false);
      assert.isNotNull(signature);
    });
    it('verify()::p-384', async () => {
      const valid = await client.verify('mock-p-384', data, signature, false);
      assert.isTrue(valid);
    });
  });
});
