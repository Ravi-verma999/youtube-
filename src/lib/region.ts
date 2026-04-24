
export async function getRegionData() {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return {
      country: data.country_name || 'US',
      countryCode: data.country_code || 'US',
      city: data.city || ''
    };
  } catch (error) {
    console.warn("Region detection failed, defaulting to Global", error);
    return {
      country: 'Global',
      countryCode: 'US',
      city: ''
    };
  }
}
