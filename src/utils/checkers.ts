function isValidRequestObject(reqObj: unknown) {
  if (!isObj(reqObj)) {
    return false;
  }

  return (reqObj instanceof Object
    && 'type' in reqObj
    && 'id' in reqObj
    && 'data' in reqObj)
}

function isObj(obj: unknown) {
  return (obj && typeof(obj));
}

export {
  isValidRequestObject,
  isObj,
};
