
export function decodeURIEncodedString(encodedString) {
    try {
        return decodeURIComponent(encodedString);
    } catch (e) {
        console.error("Error decoding string:", e);
        return encodedString; // Return original if decoding fails
    }
}