import { getFirewallResourceCount } from './resource';

// todo: ensure tagged resources exists first

it('should fetch the count of tagged resources', async () => {

  return getFirewallResourceCount()
    .then(count => {
      expect(count).toBeTruthy();
      expect(count).toBeGreaterThan(-1);
    });

});
