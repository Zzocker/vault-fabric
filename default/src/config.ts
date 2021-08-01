import { join } from 'path';
export const config = {
  CAURL: 'http://localhost:7054',
  adminID: 'admin',
  adminSecret: 'adminpw',
  walletPath: join(__dirname, '..', 'wallet'),
  mspId: 'DevMSP',
  ccpPath: join(__dirname, '..', '..', 'network', 'connection-profile.yaml'),
  channelId: 'devchannel',
  ccName: 'basic-transfer',
};
