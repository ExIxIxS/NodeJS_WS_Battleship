import { isObj } from "./checkers";

function getJsonString(item: unknown) {
  let resultStr;

  try {
    resultStr = (isObj(item))
      ? JSON.stringify(item)
      : JSON.stringify(`{message: ${item}}`);
  } catch {
    resultStr = '{status: 500, message: "server JSON converting error"}'
  }

  return resultStr;
}

export {
  getJsonString,
}