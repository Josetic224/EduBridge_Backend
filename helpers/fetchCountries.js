// helpers/fetchCountries.js
const axios = require("axios");
const fetchCountriesData = async () => {
  try {
    // Fetch all countries
    const response = await axios.get(
      "https://restcountries.com/v3.1/all?fields=name,cca2",
      { timeout: 10000 }, // 10 seconds timeout
    );

    // Map and process the country data
    const countries = response.data.map((country) => ({
      name: country.name.common,
      code: country.cca2.toLowerCase(),
      flag: `https://flagsapi.com/${country.cca2.toUpperCase()}/flat/24.png`,
    }));

    // Sort countries alphabetically
    countries.sort((a, b) => a.name.localeCompare(b.name));

    return countries;
  } catch (error) {
    console.error("Error fetching countries:", error.message);
    throw new Error("Failed to fetch countries");
  }
};

const fetchCountryByName = async (countryName) => {
  try {
    const response = await axios.get(
      "https://restcountries.com/v3.1/all?fields=name,cca2",
      { timeout: 10000 }, // 10 seconds timeout
    );

    const country = response.data.find(
      (country) =>
        country.name.common.toLowerCase() === countryName.toLowerCase(),
    );

    if (!country) {
      throw new Error(`Country "${countryName}" not found.`);
    }

    return {
      name: country.name.common,
      code: country.cca2.toLowerCase(),
      flag: `https://flagsapi.com/${country.cca2.toUpperCase()}/flat/24.png`,
    };
  } catch (error) {
    console.error("Error fetching country by name:", error.message);
    throw new Error("Failed to fetch country details");
  }
};

exports.fetchUniversitiesByCountry = async (countryName) => {
  try {
    if (!countryName || typeof countryName !== "string") {
      return res
        .status(400)
        .json({ message: "Invalid or missing country name." });
    }

    // Step 1: Validate the country using fetchCountryByName
    const country = await fetchCountryByName(countryName);

    // Step 2: Fetch universities for the validated country
    const universityResponse = await axios.get(
      `http://universities.hipolabs.com/search?country=${encodeURIComponent(country.name)}`,
    );

    // Step 3: Respond with universities and country details
    return universityResponse.data;
  } catch (error) {
    console.error("Error fetching universities:", error.message);
    throw new Error("Failed to fetch universities", error.message);
  }
};

module.exports = {
  fetchCountriesData,
  fetchUniversitiesByCountry: exports.fetchUniversitiesByCountry,
};
