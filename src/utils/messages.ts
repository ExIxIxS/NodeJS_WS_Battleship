function getServerMessageDatedTitle() {
  const date = new Date();
  const dateStr = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`

  return `[GAME SERVER] ${dateStr}`;
}

export {
  getServerMessageDatedTitle,
}