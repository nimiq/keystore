import { RequestTypes, setExecuting, setResult, setData } from '../request-redux.js';
import { Key, Keytype, keystore } from '../../keys/index.js';

// called when importing from file after entering the passphrase
export function importFromFile(passphrase, label) {
    return async (dispatch, getState) => {
        dispatch( setExecuting(RequestTypes.IMPORT_FROM_FILE) );

        try {
            // get encrypted key from request data set with _startRequest in keyguard-api
            const encryptedKey64 = getState().request.data.encryptedKey;
            const encryptedKeyPair = Nimiq.BufferUtils.fromBase64(encryptedKey64);

            // test if we can decrypt
            const key = await Key.loadEncrypted(encryptedKeyPair, passphrase);

            key.type = Keytype.HIGH;
            key.label = label;

            if (!key.label) {
                // todo get from ui
                key.label = key.userFriendlyAddress.slice(0, 9);
            }

            // actual import
            const keyInfo = {
                encryptedKeyPair: encryptedKeyPair,
                userFriendlyAddress: key.userFriendlyAddress,
                type: key.type,
                label: key.label
            };

            await keystore.putPlain(keyInfo);

            dispatch(
                setResult(RequestTypes.IMPORT_FROM_FILE, key.getPublicInfo())
            );
        } catch (e) {
            // assume the password was wrong
            dispatch(
                setData(RequestTypes.IMPORT_FROM_FILE, { isWrongPassphrase: true })
            );
        }
    }
}