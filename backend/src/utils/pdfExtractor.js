const pdf = require('pdf-parse').default || require('pdf-parse');

/**
 * Extracts raw text from a PDF buffer.
 * @param {Buffer} dataBuffer 
 * @returns {Promise<string>}
 */
const extractTextFromPDF = async (dataBuffer) => {
    try {
        const data = await pdf(dataBuffer);
        return data.text;
    } catch (error) {
        throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
};

module.exports = { extractTextFromPDF };
