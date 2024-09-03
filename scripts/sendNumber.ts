import { toNano } from '@ton/core';
import { Counter } from '../wrappers/Counter';
import {compile, NetworkProvider, sleep} from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const counter = provider.open(Counter.createFromConfig({}, await compile('Counter')));
    
    console.log('Total:', await counter.getTotal());

    // await counter.sendNumber(provider.sender(), toNano('0.005'), 22n);



}