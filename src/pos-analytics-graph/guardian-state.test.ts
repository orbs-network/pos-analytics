import BigNumber from 'bignumber.js';
// @ts-ignore legacy package has no TypeScript declarations
import { aggregate } from '@makerdao/multicall';
import { Contracts, readGuardianDataFromState } from './eth-helpers';

vi.mock('@makerdao/multicall', () => ({ aggregate: vi.fn() }));

const mockedAggregate = vi.mocked(aggregate);
const address = '0xd94f00aa2904b3e2b84ef4e665e2b3e80e1a450f';
const zero = () => new BigNumber(0);

const requiredStateResult = () => ({
    results: {
        blockNumber: new BigNumber(100),
        original: {},
        transformed: {
            b: zero(),
            s: zero(),
            cooldownStake: zero(),
            cooldownTime: zero(),
            gRewardBalance: zero(),
            gRewardClaim: zero(),
            gRPT: zero(),
            gDeltaRPT: zero(),
            gRPW: zero(),
            gDeltaRPW: zero(),
            gRewardPrecent: zero(),
            gLastRewardBalance: zero(),
            gLastRewardClaim: zero(),
            gDelegateStake: zero(),
            gFeeBalance: zero(),
            gFeeWithdraw: zero(),
            gBootBalance: zero(),
            gBootWithdraw: zero(),
            gCertified: false,
            ip: '52.79.126.85',
            name: 'LFG ORBS',
            website: 'https://example.com',
            orbsaddress: '0x682000857ef2bbe6025dc8da01d4ac57299dc51d',
            gRegTime: new BigNumber(10),
            gUpdateTime: new BigNumber(11),
            gUrl: 'https://example.com/details',
            CURRENT_BLOCK_TIMESTAMP: new BigNumber(1000)
        }
    },
    keyToArgMap: {}
});

const web3 = {
    multicallContractAddress: '0x0000000000000000000000000000000000000001',
    contractsData: {
        [Contracts.Erc20]: [{ address: '0x0000000000000000000000000000000000000002' }],
        [Contracts.Stake]: [{ address: '0x0000000000000000000000000000000000000003' }],
        [Contracts.Reward]: [{ address: '0x0000000000000000000000000000000000000004' }],
        [Contracts.Guardian]: [{ address: '0x0000000000000000000000000000000000000005' }],
        [Contracts.Delegate]: [{ address: '0x0000000000000000000000000000000000000006' }],
        [Contracts.FeeBootstrapReward]: [{ address: '0x0000000000000000000000000000000000000007' }]
    }
};

describe('Guardian current-state reads', () => {
    beforeEach(() => mockedAggregate.mockReset());

    it('keeps metadata when only the optional delegator-rewards read reverts', async () => {
        mockedAggregate
            .mockRejectedValueOnce(new Error('Returned error: execution reverted'))
            .mockRejectedValueOnce(new Error('Returned error: execution reverted'))
            .mockResolvedValueOnce(requiredStateResult() as any);

        const result = await readGuardianDataFromState(address, web3 as any);

        expect(result.details).toMatchObject({
            name: 'LFG ORBS',
            website: 'https://example.com',
            ip: '52.79.126.85',
            node_address: '0x682000857ef2bbe6025dc8da01d4ac57299dc51d'
        });
        expect(result.reward_status.delegator_rewards_balance).toBe(0);
        expect(result.reward_status.delegator_rewards_claimed).toBe(0);
        expect(mockedAggregate).toHaveBeenCalledTimes(3);
        expect(mockedAggregate.mock.calls[1][0]).toHaveLength(1);
        expect(mockedAggregate.mock.calls[2][0]).not.toContain(mockedAggregate.mock.calls[1][0][0]);
    });

    it('keeps the existing single-multicall path when every read succeeds', async () => {
        const completeResult = requiredStateResult();
        Object.assign(completeResult.results.transformed, {
            dRewardBalance: new BigNumber(2),
            dRewardClaim: new BigNumber(3),
            dGuardian: address,
            dRPT: zero(),
            dDeltaRPT: zero()
        });
        mockedAggregate.mockResolvedValueOnce(completeResult as any);

        const result = await readGuardianDataFromState(address, web3 as any);

        expect(result.reward_status.total_delegator_rewards).toBe(5e-18);
        expect(mockedAggregate).toHaveBeenCalledTimes(1);
    });
});
