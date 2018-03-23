import XElement from '/libraries/x-element/x-element.js';
import XRouter from '/elements/x-router/x-router.js';
import XSetLabel from '/libraries/keyguard/common-elements/x-set-label.js';
import XSetPassphrase from '/libraries/keyguard/common-elements/x-set-passphrase.js';
import XPrivacyAgent from '/elements/x-privacy-agent/x-privacy-agent.js';
import XShowWords from '/libraries/keyguard/common-elements/x-show-words.js';
import XIdenticons from './x-identicons/x-identicons.js';
import MixinRedux from '/elements/mixin-redux/mixin-redux.js';
import { RequestTypes, setData } from '../request-redux.js';
import { createPersistent } from './actions.js';

export default class XCreate extends MixinRedux(XElement) {

    // todo fix router, so we can fix order. Last should be first
    html() { return `
          <x-show-words x-route="create/words"></x-show-words>
          <section x-route="create/warning">
            <h1>Backup your Account</h1>
            <x-privacy-agent></x-privacy-agent>
          </section>
          <x-set-label x-route="create/set-label"></x-set-label>
          <x-set-passphrase x-route="create/set-passphrase"></x-set-passphrase>
          <x-identicons x-route="create"></x-identicons>
        `;
    }

    children() {
        return [ XSetPassphrase, XSetLabel, XIdenticons, XPrivacyAgent, XShowWords ];
    }

    static mapStateToProps(state) {
        if (state.request.requestType !== RequestTypes.CREATE) return;

        const { address } = state.request.data;

        return {
            privateKey: address && state.keys.volatileKeys.get(address).keyPair.privateKey.toHex()
        }
    }

    static get actions() {
        return { setData, createPersistent };
    }

    listeners() {
        return {
            'x-choose-identicon': this._onChooseIdenticon.bind(this),
            'x-surrounding-checked': this._onSurroundingChecked.bind(this),
            'x-set-passphrase': this._onSetPassphrase.bind(this),
            'x-set-label': this._onSetLabel.bind(this),
            'x-show-words': this._onWordsSeen.bind(this)
        }
    }

    _onChooseIdenticon(address) {
        this.actions.setData(RequestTypes.CREATE, { address } );
        XRouter.root.goTo('create/warning');
    }

    _onSurroundingChecked() {
        XRouter.root.goTo('create/set-passphrase');
    }

    _onSetPassphrase(passphrase) {
        this.actions.setData(RequestTypes.CREATE, { passphrase });
        XRouter.root.goTo('create/set-label');
    }

    _onSetLabel(label) {
        this.actions.setData(RequestTypes.CREATE, { label });
        this.actions.setData(RequestTypes.CREATE, { privateKey: this.properties.privateKey })
        XRouter.root.goTo('create/words');
    }

    _onWordsSeen() {
        this.actions.createPersistent();
    }
}
