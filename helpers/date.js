

const timeDifference = {
    "1hr": 3600,
    "2m": 120,
  };
  
/**
 * Calculates the number of seconds between the current time and the given time.
 *
 * @param {number} time - The timestamp in milliseconds to compare against the current time.
 * @returns {number} The difference in seconds between the current time and the given time.
 */

  const getSecondsBetweenTime = (time) => {
    const currentTime = new Date().getTime();
  
    const diff = currentTime - time;
  
    const seconds = Math.floor(diff / 1000); // for seconds
  
    return seconds;
  };
  
  module.exports = { timeDifference, getSecondsBetweenTime };