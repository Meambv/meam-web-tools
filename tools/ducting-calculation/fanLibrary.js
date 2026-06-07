import fanLibrary from "./fanLibrary.json" with { type: "json" };

export const FAN_LIBRARY = Object.freeze(fanLibrary);

export function getDefaultFanForRole(role) {
  return FAN_LIBRARY.fans.find((fan) => fan.isDefaultForRoles.includes(role));
}