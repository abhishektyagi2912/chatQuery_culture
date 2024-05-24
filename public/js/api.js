// api.js
export async function fetchBookingData() {
    const url = 'https://mobileapi.cultureholidays.com/api/Holidays/GetPackageBooking?AgencyID=CHAGT0001000012263';
    const requestData = {};

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        throw error;
    }
}
