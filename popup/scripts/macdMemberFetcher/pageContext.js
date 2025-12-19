function fetchMacdMembersInPageContext() {
  console.log('Fetching MACD members using GlideRecord...');
  try {
    if (typeof GlideRecord === 'undefined') {
      console.log('GlideRecord not available');
      return [];
    }
    const grGroup = new GlideRecord('sys_user_group');
    grGroup.addQuery('name', 'MS MACD');
    grGroup.query();
    if (!grGroup.next()) {
      console.log('MS MACD group not found');
      return [];
    }
    const groupSysId = grGroup.getUniqueValue();
    console.log('Found MS MACD group:', groupSysId);
    const grUser = new GlideRecord('sys_user');
    grUser.addQuery('assignment_group', groupSysId);
    grUser.addActiveQuery();
    grUser.query();
    const members = [];
    while (grUser.next()) {
      const name = grUser.getValue('name');
      if (name) members.push(name);
    }
    if (members.length > 0) {
      members.sort();
      console.log(`Found ${members.length} MACD members`);
      return members;
    }
    console.log('No members found');
    return [];
  } catch (e) {
    console.error('Error:', e.message || e);
    return [];
  }
}
