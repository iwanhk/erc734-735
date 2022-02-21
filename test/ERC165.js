import { expectRevert } from "openzeppelin-test-helpers";
import { setupTest } from "./base";
import { printTestGas } from "./util";

const TestContract = artifacts.require("TestContract");

contract("ERC165", async (accounts) => {
    let identity, addr, keys;
    const input = [
        ["0xffffffff", false],
        ["0x01ffc9a7", true], // ERC165
        ["0xfccbffbc", true], // ERC734
        ["0xcb1c73dc", true], // ERC735
        ["0x37d78c60", true], // ERC734 + ERC735
    ];

    afterEach("print gas", printTestGas);

    beforeEach("new contract", async () => {
        ({ identity, addr, keys } = await setupTest(accounts, [2, 2, 0, 0], [3, 3, 0, 0]));
    });

    it("checks ERC165 signatures", async () => {
        let id = await identity.ERC165ID();
        assert.equal(id, input[1][0]);
        let erc734 = await identity.ERC734ID();
        assert.equal(erc734, input[2][0]);
        let erc735 = await identity.ERC735ID();
        assert.equal(erc735, input[3][0]);
        erc734 = web3.utils.toBN(erc734);
        erc735 = web3.utils.toBN(erc735);
        assert.equal(web3.utils.numberToHex(erc734.xor(erc735)), input[4][0]);
    });

    it("noThrowCall doesn't throw", async () => {
        let test = await TestContract.deployed();
        let success, result;
        // Call reverts
        await expectRevert(test.supportsInterface("0xffffffff"), "Don't call me");
        // Staticcall doesn't
        ({ success, result } = await test.noThrowCall(test.address, "0xffffffff"));
        assert.isFalse(success);
    });

    it("noThrowCall works", async () => {
        let test = await TestContract.deployed();
        let success, result;
        for (let [sig, expected] of input) {
            ({ success, result } = await test.noThrowCall(identity.address, sig));
            assert.isTrue(success);
            assert.equal(expected, result);
        }
    });

    it("ERC165Query works", async () => {
        let test = await TestContract.deployed();
        for (let [sig, expected] of input) {
            let result = await test.doesContractImplementInterface(identity.address, sig);
            assert.equal(expected, result);
        }
    });

    it("Identity supports ERC165, ERC734, ERC735", async () => {
        for (let [sig, expected] of input) {
            let result = await identity.supportsInterface(sig);
            assert.equal(expected, result);
        }
    });
});
