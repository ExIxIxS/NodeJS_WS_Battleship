function getServerMessageDatedTitle(): string {
  const date = new Date();
  const dateStr = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

  return `[GAME SERVER] ${dateStr}`;
}

function getServerMessageDatedTitleWithWsId(wsId: number): string {
  return `${getServerMessageDatedTitle()} [wsId: ${wsId}]`;
}

export { getServerMessageDatedTitle, getServerMessageDatedTitleWithWsId };
