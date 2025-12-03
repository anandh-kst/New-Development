export const isValidValue = (value) =>
  value !== null && value !== undefined && !Number.isNaN(value) && value !== 0;

export const getSourceType = (nonStructuredArray) => {
  if (!nonStructuredArray || nonStructuredArray.length === 0) return true;
  const type =
    nonStructuredArray[0]?.logType || nonStructuredArray[0]?.type || "device";
  return type !== "manual";
};