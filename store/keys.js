import Key from '../keys/key.js';

export const TypeKeys = {
    ADD: 'keys/add',
    CLEAR: 'keys/clear',
    REQUEST_PERSIST: 'keys/requestPersist',
    CLEAR_PERSIST: 'keys/requestPersist'
};

export function reducer(state, action) {
    if (state === undefined) {
        return {
            volatileKeys: new Map(),
            toBePersisted: null
        }
    }

    switch (action.type) {
        case TypeKeys.ADD:
            const map = new Map(state.volatileKeys);

            for (const key of action.payload) {
                map.set(key.userFriendlyAddress, key);
            }

            return {
                ...state,
                volatileKeys: map
            };

        case TypeKeys.CLEAR:
            return {
                ...state,
                volatileKeys: new Map()
            };

        case TypeKeys.REQUEST_PERSIST:
            return {
                ...state,
                toBePersisted: action.userFriendlyAddress
            };

        case TypeKeys.CLEAR_PERSIST:
            return {
                ...state,
                toBePersisted: null
            };

        default:
            return state
    }
}

export function addVolatile(key) {
    return {
        type: TypeKeys.ADD,
        key
    }
}

export function clearVolatile() {
    return {
        type: TypeKeys.CLEAR
    }
}

export function requestPersist(userFriendlyAddress) {
    return {
        type: TypeKeys.REQUEST_PERSIST,
        userFriendlyAddress
    }
}

export function clearPersist() {
    return {
        type: TypeKeys.CLEAR_PERSIST,
    }
}

export function createVolatile(number) {
    const keys = [];

    for (let i = 0; i < number; i++) {
        const keyPair = Nimiq.KeyPair.generate();
        const key = new Key(keyPair);
        keys.push(key);
    }

    return {
        type: TypeKeys.ADD,
        payload: keys
    }
}


// move toBePersisted to request (userinput) store