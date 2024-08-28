import {Blockchain, SandboxContract, TreasuryContract} from '@ton/sandbox';
import {Cell, toNano} from '@ton/core';
import {Counter} from '../wrappers/Counter';
import '@ton/test-utils';
import {compile} from '@ton/blueprint';

describe('Counter', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Counter');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let counter: SandboxContract<Counter>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        counter = blockchain.openContract(Counter.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await counter.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: counter.address,
            success: false,
            exitCode: 35
        });
    });

    it('should update the number ', async () => {
        const caller = await blockchain.treasury('caller');

        await counter.sendNumber(caller.getSender(), toNano('0.005'), 100n);
        const counterNum = await counter.getTotal();
        expect(counterNum).toEqual(110n);

        await counter.sendNumber(caller.getSender(), toNano('0.005'), 50n);
        const counterNum2 = await counter.getTotal();
        expect(counterNum2).toEqual(160n);

        await counter.sendNumber(caller.getSender(), toNano('0.005'), 1000n);
        const counterNum3 = await counter.getTotal();
        expect(counterNum3).toEqual(1160n);

    });

    it('should throw error is not 32 bits ', async () => {
        const caller = await blockchain.treasury('caller');
        const result = await counter.sendDeploy(
            caller.getSender(),
            toNano('0.01'),
        );

        expect(result.transactions).toHaveTransaction({
            from: caller.address,
            to: counter.address,
            success: false,
            exitCode: 35
        });
    });

});
