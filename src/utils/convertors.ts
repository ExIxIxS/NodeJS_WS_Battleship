import { SERVER_JSON_ERROR_MESSAGE } from "../constants/messages";
import { isObj } from "./checkers";

function getJsonString(item: unknown): string {
  let resultStr: string;

  try {
    resultStr = (isObj(item))
      ? JSON.stringify(item)
      : JSON.stringify({message: item});
  } catch {
    resultStr = JSON.stringify({
      status: 500,
      message: SERVER_JSON_ERROR_MESSAGE
    });
  }

  return resultStr;
}

function getParsed(str: unknown): unknown {
  return (typeof(str) === 'string')
    ? JSON.parse(str)
    : str;
}

export {
  getJsonString,
  getParsed,
}
