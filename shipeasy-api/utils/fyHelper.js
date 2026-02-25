/**
 * Financial Year Helper Utilities
 * 
 * Financial Year (FY) in India starts on April 1st and ends on March 31st.
 * Example: FY 2026-27 runs from April 1, 2026 to March 31, 2027
 */

/**
 * Get the current financial year string (e.g., "2025-26")
 * FY starts April 1st and ends March 31st
 * 
 * @param {Date} [date] - Optional date to calculate FY for (defaults to now)
 * @returns {string} Financial year string in format "YYYY-YY"
 */
function getCurrentFinancialYear(date = new Date()) {
    const month = date.getMonth() + 1; // 1-12
    const year = date.getFullYear();

    let startYear, endYear;

    // Before April → previous FY
    if (month < 4) {
        startYear = (year - 1) % 100;
        endYear = year % 100;
    } 
    // April onwards → current FY
    else {
        startYear = year % 100;
        endYear = (year + 1) % 100;
    }

    return `${startYear.toString().padStart(2, '0')}-${endYear
        .toString()
        .padStart(2, '0')}`;
}


/**
 * Get the FY key for use in MongoDB field names
 * Converts "2025-26" to "2025_26" (dots not allowed in MongoDB field names with $inc)
 * 
 * @param {string} fy - Financial year string (e.g., "2025-26")
 * @returns {string} FY key for MongoDB field names
 */
function getFYKey(fy) {
    return fy.replace('-', '_');
}

/**
 * Get FY start and end dates
 * 
 * @param {string} fy - Financial year string (e.g., "2025-26")
 * @returns {{ startDate: Date, endDate: Date }} Start and end dates of the FY
 */
function getFYDateRange(fy) {
    const [startYear] = fy.split('-').map(Number);

    // FY starts April 1st at 00:00:00
    const startDate = new Date(startYear, 3, 1, 0, 0, 0, 0); // Month is 0-indexed, so 3 = April

    // FY ends March 31st at 23:59:59.999
    const endDate = new Date(startYear + 1, 2, 31, 23, 59, 59, 999); // Month 2 = March

    return { startDate, endDate };
}

/**
 * Check if a date falls within a specific financial year
 * 
 * @param {Date} date - Date to check
 * @param {string} fy - Financial year string (e.g., "2025-26")
 * @returns {boolean} True if date is within the FY
 */
function isDateInFY(date, fy) {
    const { startDate, endDate } = getFYDateRange(fy);
    return date >= startDate && date <= endDate;
}

/**
 * Get the next financial year string
 * 
 * @param {string} [currentFY] - Current FY string (defaults to current FY)
 * @returns {string} Next financial year string in format "YYYY-YY"
 */
function getNextFinancialYear(currentFY) {
    if (!currentFY) {
        currentFY = getCurrentFinancialYear();
    }

    const [startYear] = currentFY.split('-').map(Number);
    const nextStartYear = startYear + 1;
    const nextEndYear = (nextStartYear + 1) % 100;

    return `${nextStartYear}-${nextEndYear.toString().padStart(2, '0')}`;
}

/**
 * Get the start date of the next financial year
 * 
 * @param {string} [currentFY] - Current FY string (defaults to current FY)
 * @returns {Date} Start date of the next FY (April 1st of next year)
 */
function getNextFYStartDate(currentFY) {
    if (!currentFY) {
        currentFY = getCurrentFinancialYear();
    }

    const [startYear] = currentFY.split('-').map(Number);
    // Next FY starts on April 1st of the following year
    return new Date(startYear + 1, 3, 1, 0, 0, 0, 0); // Month 3 = April
}

/**
 * Simulate what FY a date would be in (for testing purposes)
 * 
 * @param {Date} simulatedDate - The date to simulate
 * @returns {{ fy: string, fyKey: string, isNewFY: boolean }} FY info for the simulated date
 */
function simulateFYForDate(simulatedDate) {
    const currentFY = getCurrentFinancialYear();
    const simulatedFY = getCurrentFinancialYear(simulatedDate);

    return {
        fy: simulatedFY,
        fyKey: getFYKey(simulatedFY),
        isNewFY: simulatedFY !== currentFY,
        currentFY: currentFY
    };
}

module.exports = {
    getCurrentFinancialYear,
    getFYKey,
    getFYDateRange,
    isDateInFY,
    getNextFinancialYear,
    getNextFYStartDate,
    simulateFYForDate
};
