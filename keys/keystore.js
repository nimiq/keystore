import Key from './key.js';

class KeyStore {

    static get instance() {
        this._instance = this._instance || new KeyStore();
        return this._instance;
    }

    /**
     * @constructor
     */
    constructor(dbName = 'accounts') {
        this._dbInitialized = new Promise((resolve, reject) => {
            const request = self.indexedDB.open(dbName, KeyStore.VERSION);

            request.onerror = () => reject(request.error);

            request.onupgradeneeded = () => {
                this._db = request.result;

                this._db.createObjectStore(KeyStore.ACCOUNT_DATABASE, { keyPath: 'userFriendlyAddress' });

                // todo later
                this._multiSigStore = null;
            };

            request.onsuccess = () => {
                this._db = request.result;
                resolve();
            }
        });
    }

    _getStore(storeName, mode) {
        return new Promise(async (resolve, reject) => {
            await this._dbInitialized;

            const transaction = this._db.transaction([storeName], mode)

            transaction.onerror = () => reject(transaction.error);

            resolve(transaction.objectStore(storeName));
        });
    }

    _getResult(request) {
        return new Promise (async (resolve, reject)=> {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    get _accountStoreRead() {
        return this._getStore(KeyStore.ACCOUNT_DATABASE, 'readonly');
    }

    get _accountStoreWrite() {
        return this._getStore(KeyStore.ACCOUNT_DATABASE, 'readwrite');
    }

    /**
     * @param {Address} address
     * @param {Uint8Array|string} key
     * @returns {Promise.<Wallet>}
     */
    async get(address, key) {
        await this._dbInitialized;
        const request = (await this._accountStoreRead).get(address);
        const account = await this._getResult(request);

        return account;

        /*
        const buf = await new Promise (async (resolve, reject)=> {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });*/

        if (key) {
            return Account.loadEncrypted(buf, key);
        }

        return Account.loadPlain(buf);
    }

    /**
     * @param {Wallet} account
     * @param {Uint8Array|string} [key]
     * @param {Uint8Array|string} [unlockKey]
     * @returns {Promise}
     */
    async put(account, key, unlockKey) {
        await this._dbInitialized;
        // todo
        /*const base64Address = account.address.toBase64();
        /** @type {Uint8Array} */
        /*let buf = null;
        if (key) {
            buf = await account.exportEncrypted(key, unlockKey);
        } else {
            buf = account.exportPlain();
        }*/

        const request = (await this._accountStoreWrite).put(account);

        return await this._getResult(request);
    }

    /**
     * @param {Address} address
     * @returns {Promise}
     */
    async remove(address) {
        await this._dbInitialized;

        const request = (await this._accountStoreWrite).remove(address);

        return await this._getResult(request);
    }

    /**
     * @returns {Address[]}
     */
    async list() {
        await this._dbInitialized;

        const request = (await this._accountStoreRead).getAll();

        const accounts = await this._getResult(request);

        const result = [...accounts].map(account => ({
            userFriendlyAddress: account.userFriendlyAddress,
            address: account.address,
            type: account.type
        }));

        return result;
    }

    /**
     * After account was successfully backuped, allow its use
     *
     * @param userFriendlyAddress
     * @return {Promise<void>}
     */
    async activate(userFriendlyAddress) {
        // todo implement
    }

    /**
     * @param {Address} address
     * @param {Uint8Array|string} [key]
     * @returns {Promise.<MultiSigWallet>}
     */
    /*async getMultiSig(address, key) {
        await this._dbInitialized;
        const base64Address = address.toBase64();
        const buf = await this._multiSigStore.get(base64Address);
        if (key) {
            return MultiSigWallet.loadEncrypted(buf, key);
        }
        return MultiSigWallet.loadPlain(buf);
    }*/

    /**
     * @param {MultiSigWallet} wallet
     * @param {Uint8Array|string} [key]
     * @param {Uint8Array|string} [unlockKey]
     * @returns {Promise}
     */
    /*async putMultiSig(wallet, key, unlockKey) {
        await this._dbInitialized;
        const base64Address = wallet.address.toBase64();
        /** @type {Uint8Array} */
        /*let buf = null;
        if (key) {
            buf = await wallet.exportEncrypted(key, unlockKey);
        } else {
            buf = wallet.exportPlain();
        }
        return this._multiSigStore.put(base64Address, buf);
    }*/

    /**
     * @param {Address} address
     * @returns {Promise}
     */
    /*async removeMultiSig(address) {
        await this._dbInitialized;
        const base64Address = address.toBase64();
        return this._multiSigStore.remove(base64Address);
    }*/

    /**
     * @returns {Promise<Array.<Address>>}
     */
    /*async listMultiSig() {
        await this._dbInitialized;
        const keys = await this._multiSigStore.keys();
        return Array.from(keys).map(key => Nimiq.Address.fromBase64(key));
    }*/

    close() {
        return this._db.close();
    }
}

KeyStore.VERSION = 2;
KeyStore.ACCOUNT_DATABASE = 'accounts';
KeyStore.MULTISIG_WALLET_DATABASE = 'multisig-wallets';

export default KeyStore.instance;
