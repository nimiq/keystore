import { RPC } from '/libraries/boruca-messaging/src/boruca.js';
import KeyguardApi from './requests/keyguard-api.js';
import AccessControl from './access-control/access-control.js';
import SafePolicy from './access-control/safe-policy.js';
//import WalletPolicy from './access-control/wallet-policy.js';
import MinerPolicy from './access-control/miner-policy.js';
import PromoPolicy from './access-control/promo-policy.js';
import ShopPolicy from './access-control/shop-policy.js';
import GetSomeAppPolicy from './access-control/getsome-app-policy.js';
import Config from '/libraries/secure-utils/config/config.js';
import store from './store.js';

class Keyguard {
    constructor() {
        // configure access control
        const defaultPolicies = [
            {
                origin: Config.origin('safe'),
                policy: new SafePolicy()
            },
            /*{
                origin: Config.origin('wallet'),
                policy: new WalletPolicy(1000)
            },*/
            {
                origin: Config.origin('miner'),
                policy: new MinerPolicy()
            },
            {
                origin: Config.origin('promo'),
                policy: new PromoPolicy()
            },
            {
                origin: Config.origin('shop'),
                policy: new ShopPolicy()
            },
            {
                origin: Config.origin('getsome'),
                policy: new GetSomeAppPolicy()
            },
        ];

        // cancel request when window is closed
        self.onbeforeunload = () => {
            const { reject, result }  = store.getState().request;
            if (reject && !result){
                reject(new Error('Keyguard window was closed.'));
            }
        };

        // cancel request and close window when there is an error
        if (!Config.devMode) {
            self.onerror = (error) => {
                const { reject } = store.getState().request;
                if (reject) {
                    reject(error);
                    self.close();
                }
            };

            // cancel request and close window when there is an unhandled promise rejection
            self.onunhandledrejection = (event) => {
                const { reject } = store.getState().request;
                if (reject) {
                    reject(new Error(event.reason));
                    self.close();
                }
            };
        }


        // start postMessage RPC server
        this._api = RPC.Server(AccessControl.addAccessControl(
            KeyguardApi, () => store.getState(), defaultPolicies
        ), true, KeyguardApi.RPC_WHITELIST.concat(AccessControl.RPC_WHITELIST));

        // tell calling window that we are ready
        const client = self === top ? self.opener :  self.parent;
        client.postMessage('ready', '*');
    }
}

(async function() {
    if (window.Nimiq) {
        await Nimiq.loadOffline();
        Nimiq.GenesisConfig[Config.network]();
    }
    window.keyguard = new Keyguard();
})();
