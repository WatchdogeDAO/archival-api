const axios = require('axios');
const {connect} = require('@aragon/connect');
const {CuratedList} = require('connect-thegraph-curated-list');

const main = async () => {
  try {
    const org = await connect('0x5005e04882845575f7433796B0DF0858e901B544', 'thegraph', {
      chainId: 4,
    });
    console.log('The org:', org);
    const apps = await org.apps();
    const {address} = apps.find(app => app.appName.includes('list.open'));
    console.log('The app address', address);
    const curatedList = await new CuratedList(
      address,
      'https://api.thegraph.com/subgraphs/name/mauerv/aragon-registry-rinkeby-staging'
    );
    const members = await curatedList.members();
    console.log('Members:', members);
    const selectedMember = members.find(member => member.id === '100100');
    const isArchiver = selectedMember !== undefined;
    return isArchiver;
  } catch (err) {
    console.log('Error:', err);
  }
};

main();
