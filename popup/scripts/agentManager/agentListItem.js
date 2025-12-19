function createAgentListItem(agent, index) {
  const agentItem = document.createElement('div');
  agentItem.className = 'agent-list-item';
  agentItem.dataset.agentName = agent;
  const agentNameSpan = document.createElement('span');
  agentNameSpan.className = 'agent-name';
  agentNameSpan.textContent = agent;
  agentNameSpan.id = `agent-name-${index}`;
  agentNameSpan.style.cursor = 'pointer';
  agentNameSpan.title = 'Click to select this agent';
  agentNameSpan.addEventListener('click', async e => { e.stopPropagation(); await selectAgent(agent); });
  const editBtn = document.createElement('button');
  editBtn.className = 'agent-action-btn agent-edit-btn';
  editBtn.textContent = 'Edit';
  editBtn.title = 'Edit agent name';
  editBtn.setAttribute('aria-label', `Edit agent ${agent}`);
  editBtn.addEventListener('click', e => { e.stopPropagation(); editAgent(agent, index); });
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'agent-action-btn agent-delete-btn';
  deleteBtn.textContent = 'Delete';
  deleteBtn.title = 'Delete agent';
  deleteBtn.setAttribute('aria-label', `Delete agent ${agent}`);
  deleteBtn.addEventListener('click', e => { e.stopPropagation(); deleteAgent(agent); });
  agentItem.append(agentNameSpan, editBtn, deleteBtn);
  const select = document.getElementById('taskmaster-agent-input');
  if (select && select.value === agent) agentItem.classList.add('selected');
  return agentItem;
}
