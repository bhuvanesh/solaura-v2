function convertToWords(amount) {
    const crore = 10000000;
    const lakh = 100000;
    const thousand = 1000;
    const hundred = 100;
  
    const units = ["", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN"];
    const tens = ["", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"];
  
    function convertNumberToWords(num) {
      if (num < 20) return units[num];
      if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? " " + units[num % 10] : "");
      if (num < thousand) return units[Math.floor(num / hundred)] + " HUNDRED" + (num % hundred !== 0 ? " AND " + convertNumberToWords(num % hundred) : "");
      if (num < lakh) return convertNumberToWords(Math.floor(num / thousand)) + " THOUSAND" + (num % thousand !== 0 ? " " + convertNumberToWords(num % thousand) : "");
      if (num < crore) return convertNumberToWords(Math.floor(num / lakh)) + " LAKH" + (num % lakh !== 0 ? " " + convertNumberToWords(num % lakh) : "");
      return convertNumberToWords(Math.floor(num / crore)) + " CRORE" + (num % crore !== 0 ? " " + convertNumberToWords(num % crore) : "");
    }
  
    // Split the amount into rupees and paise
    const [rupees, paise] = amount.toString().split('.');
    
    let result = convertNumberToWords(parseInt(rupees));
    result += " RUPEES";
  
    if (parseInt(paise) > 0) {
      result += " AND " + convertNumberToWords(parseInt(paise)) + " PAISE";
    }
  
    return result + " ONLY";
  }
  
  export default convertToWords;