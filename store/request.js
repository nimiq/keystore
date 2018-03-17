import keystore from '../keys/keystore.js';
import * as Keytype from '../keys/keytype.js';

// Requests which need UI
export const RequestTypes = {
    SIGN_TRANSACTION: 'signTransaction',
    SIGN_MESSAGE: 'signMessage',
    CREATE: 'create',
    IMPORT_FILE: 'importFile',
    IMPORT_WORDS: 'importWords',
    EXPORT: 'export'
};

export const TypeKeys = {
    START: 'request/start',
    SET_DATA: 'request/setData',
    CONFIRM: 'request/confirm',
    DENY: 'request/deny',
    SET_RESULT: 'request/result',
    SET_ERROR: 'request/error'
};

export function reducer(state, action) {
    const initialState = {
        requestType: undefined,
        completed: false,
        confirmed: undefined,
        data: {},
        result: undefined
    };

    if (state === undefined) {
        return initialState;
    }

    // check if request type of action matches running request, if present
    if (action.type !== TypeKeys.START && state.requestType !== action.requestType) {
        return {
            ...initialState,
            error: 'Request type does not match'
        };
    }

    switch (action.type) {
        case TypeKeys.START:
            if (state.requestType) {
                return {
                    ...initialState,
                    error: 'Multiple Requests'
                };
            }

            return {
                ...state,
                requestType: action.requestType,
                data: {
                    ...state.data,
                    ...action.data
                }
            };

        case TypeKeys.CONFIRM:
            if (state.requestType !== action.requestType) {
                return {
                    ...initialState,
                    error: 'Request type does not match'
                };
            }

            return {
                completed: true,
                confirmed: true,
                data: {
                    ...state.data,
                    ...action.data
                }
            };

        case TypeKeys.SET_DATA:
            return {
                ...state,
                data: {
                    ...state.data,
                    ...action.data
                }
            };

        case TypeKeys.CONFIRM:
            return {
                ...state,
                confirmed: true,
                data: {
                    ...state.data,
                    password: action.password,
                    label: action.label
                }
            };

        case TypeKeys.DENY:
            return {
                ...state,
                completed: true,
                confirmed: false
            };

        case TypeKeys.SET_RESULT:
            return {
                ...state,
                completed: true,
                confirmed: true,
                result: action.result
            };

        case TypeKeys.SET_ERROR:
            return {
                ...state,
                error: action.error
            };

        default:
            return state
    }
}

export function start(requestType, data) {
    return {
        type: TypeKeys.START,
        requestType,
        data
    };
}

export function setData(requestType, data) {
    return {
        type: TypeKeys.SET_DATA,
        requestType,
        data
    };
}

export function confirm(requestType, data) {
    return {
        type: TypeKeys.CONFIRM,
        requestType,
        data
    }
}

export function deny(requestType) {
    return {
        type: TypeKeys.DENY,
        requestType
    };
}

export function setResult(requestType, result) {
    return {
        type: TypeKeys.SET_RESULT,
        requestType,
        result
    }
}

export function setError(requestType, error) {
    return {
        type: TypeKeys.SET_ERROR,
        requestType,
        error
    }
}

export function confirmPersist(passphrase, label = '') {
    return async (dispatch, getState) => {
        const state = getState();
        const key = state.keys.volatileKeys.get(state.request.data.address);

        key.type = Keytype.high;
        key.label = label;

        if (await keystore.put(key, passphrase)) {
            dispatch(
                setResult(RequestTypes.CREATE, {
                    address: key.address,
                    label: key.label,
                    publicKey: key.keyPair.publicKey
                })
            );
        } else {
            dispatch(
                setError(RequestTypes.CREATE, 'Key could not be persisted')
            );
        }
    }
}