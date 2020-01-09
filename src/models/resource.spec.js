import { getFirewallResourceCount, getResourcesByTag } from './resource';
import database from '../database';

// Connection should be closed everytime models are used
afterAll(() => database.close());

// todo: ensure tagged resources exists first
it('should fetch the count of firewall resources', () => getFirewallResourceCount()
  .then(count => {
    expect(count).toBeTruthy();
    expect(count).toBeGreaterThan(-1);
  }));

it('should fetch tagged resources', () => getResourcesByTag('firewall_think')
  .then(resources => {
    expect(resources).toBeTruthy();
    expect(resources.length).toBeGreaterThan(-1);
    if (resources[0]) expect(resources[0].id).toBeDefined();
  }));
