/* eslint-disable no-unused-expressions */
import { oneEvent, fixture, expect, fixtureCleanup } from '@open-wc/testing';

import '../src/pb-page.js';
import '../src/pb-restricted.js';
import '../src/pb-login.js';

describe('restricted sections', () => {
    afterEach(() => {
      fixtureCleanup();
    });
    it('should show restricted section', async () => {
        const el = (
            await fixture(`
                <pb-page endpoint="${ __karma__.config.endpoint }">
                    <pb-restricted login="loginElem">
                        <p>RESTRICTED</p>
                        <p slot="fallback">FALLBACK</p>
                    </pb-restricted>
                    <pb-login id="loginElem" user="tei" password="${__karma__.config.passwd}"></pb-login>
                </pb-page>
            `)
        );
        await oneEvent(document, 'pb-login');

        const restricted = el.querySelector('pb-restricted');
        const slot = restricted.shadowRoot.querySelector('slot');
        expect(slot.assignedElements()[0].innerHTML).to.equal('RESTRICTED');
    });

    it('should show fallback', async () => {
        const el = (
            await fixture(`
                <pb-page endpoint="${ __karma__.config.endpoint }">
                    <pb-restricted login="loginElem">
                        <p>RESTRICTED</p>
                        <p slot="fallback">FALLBACK</p>
                    </pb-restricted>
                    <pb-login id="loginElem" user="tei" password="INVALID"></pb-login>
                </pb-page>
            `)
        );
        await oneEvent(document, 'pb-login');

        const restricted = el.querySelector('pb-restricted');
        const slot = restricted.shadowRoot.querySelector('slot');
        expect(slot.assignedElements()[0].innerHTML).to.equal('FALLBACK');
    });
});