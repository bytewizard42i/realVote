const { runStructuralTests } = require('../../midnight-modules/tests/structural-test-helper.cjs');
const path = require('path');

runStructuralTests('zvoting', path.join(__dirname, '..', 'build', 'zvoting', 'contract', 'index.d.ts'), {
  expected: ['advance_epoch', 'citizenship_valid', 'claim_election_admin', 'close_election', 'create_election', 'election_grant_valid', 'eligibility_valid', 'get_results', 'open_voting', 'pol_valid', 'vote'],
  mustHave: ['create_election', 'vote', 'pol_valid', 'eligibility_valid', 'get_results'],
});
