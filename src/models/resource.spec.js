import { getFirewallResourceCount, getResourcesByTag } from './resource';

// todo: ensure tagged resources exists first

it('should fetch the count of firewall resources', () => {

  return getFirewallResourceCount()
    .then(count => {
      expect(count).toBeTruthy();
      expect(count).toBeGreaterThan(-1);
    });

});

it('should fetch tagged resources', () => {

  return getResourcesByTag('firewall_think')
    .then(resources => {
      expect(resources).toBeTruthy();
      expect(resources.length).toBeGreaterThan(-1);
      if(resources[0])
        expect(resources[0].id).toBeDefined();
    });

});
