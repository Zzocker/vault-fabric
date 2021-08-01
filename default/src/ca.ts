import CA from 'fabric-ca-client';
import { User } from 'fabric-common';
import { X509Identity, Wallets } from 'fabric-network';
import { config } from './config';

async function enrollAdmin(ca: CA): Promise<User> {
  const resp = await ca.enroll({
    enrollmentID: config.adminID,
    enrollmentSecret: config.adminSecret,
  });
  const user = new User('admin');

  await user.setEnrollment(resp.key, resp.certificate, 'DevMSP');
  return user;
}

export async function register(id: string) {
  const ca = new CA(config.CAURL);
  const admin = await enrollAdmin(ca);
  const wallet = await Wallets.newFileSystemWallet(config.walletPath);
  if ((await wallet.get(id)) !== undefined) {
    console.log(`[register] ${id} already enrolled`);
  }
  const secret = await ca.register(
    {
      enrollmentID: id,
      affiliation: 'org1.department1',
    },
    admin
  );

  const resp = await ca.enroll({
    enrollmentID: id,
    enrollmentSecret: secret
  })

  const identity:X509Identity = {
    type: 'X.509',
    credentials: {
      privateKey: resp.key.toBytes(),
      certificate: resp.certificate
    },
    mspId: config.mspId
  }

  await wallet.put(id,identity)
}
