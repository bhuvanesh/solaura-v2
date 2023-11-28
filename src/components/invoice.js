"use client"
import { useState, useEffect } from 'react';
import ExcelJS from 'exceljs';

const ExcelModifier = ({ data }) => {
  const [workbook, setWorkbook] = useState(null);


  useEffect(() => {
    const loadFile = async () => {
      const response = await fetch('/template.xlsx');
      const arrayBuffer = await response.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      setWorkbook(workbook);
      handleFileDownload(workbook); 
    };
  
    loadFile();
  }, []);

  const handleFileDownload = async (workbook) => {
    if (!workbook) {
      console.error('Workbook is not loaded');
      return;
    }

    function convertToUSWords(num) {
      const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
      const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
      const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
      const scales = ['', 'thousand', 'million', 'billion'];
    
      function toWords(n, scale) {
        if (n === 0) return '';
        if (n < 10) return ones[n] + ' ' + scales[scale] + ' ';
        if (n < 20) return teens[n - 10] + ' ' + scales[scale] + ' ';
        if (n < 100) return tens[Math.floor(n / 10)] + ' ' + ones[n % 10] + ' ' + scales[scale] + ' ';
        if (n < 1000) return ones[Math.floor(n / 100)] + ' hundred ' + toWords(n % 100, scale);
        return toWords(Math.floor(n / 1000), scale + 1) + ' ' + toWords(n % 1000, scale);
      }
    
      const integerPart = Math.floor(num);
      const decimalPart = Math.round((num - integerPart) * 100);
    
      let words = toWords(integerPart, 0).trim();
    
      if (decimalPart > 0) {
        words += ' and ' + toWords(decimalPart, 0).trim() + ' cents';
      }
    
      return words + ' only';
    }
  
    const worksheet = workbook.getWorksheet(1);
    const fontName = 'Times New Roman';
  
    const modifyCell = (cellRef, value, fontSize, bold = false) => {
      const cell = worksheet.getCell(cellRef);
      cell.value = value;
      cell.font = {
        name: fontName,
        size: fontSize,
        bold: bold
      };
    };
    const setColumnWidth = (columnLetter, width) => {
      const column = worksheet.getColumn(columnLetter);
      column.width = width;
    };
  
    setColumnWidth('I', 13);
    setColumnWidth('K', 13);
    setColumnWidth('O', 15);
  
    modifyCell('C4', data.groupName, 17, true);
    modifyCell('H20', `${data.invoicePeriodFrom} to ${data.invoicePeriodTo}`, 12);
    modifyCell('C20', data.project, 12);
    modifyCell('C6', 'GST: ' + data.gst, 14, true);
    modifyCell('C5', 'PAN: ' + data.pan, 14, true);
    modifyCell('K13', data.address, 13);
  
    const calcValue = parseFloat((data.issued * data.netRate).toFixed(4));
    const calcValueWithRate = parseFloat((calcValue * 0.09).toFixed(4));
    const o38Value = calcValue + 2 * calcValueWithRate;
    const o38ValueInWords = convertToUSWords(o38Value);
    modifyCell('H40', o38ValueInWords, 12);  
    modifyCell('G31', calcValue, 14);
    modifyCell('I31', calcValueWithRate, 14);
    modifyCell('K31', calcValueWithRate, 14);
    modifyCell('G37', calcValue, 14, true);
    modifyCell('I37', calcValueWithRate, 14, true);
    modifyCell('K37', calcValueWithRate, 14, true);
    modifyCell('O38', parseFloat((calcValue + 2 * calcValueWithRate).toFixed(4)), 14, true);
    modifyCell('C31', `Purchase of renewable attributes for I-REC (${data.issued} units at INR ${data.netRate} per unit)`, 14);

   
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'invoice.xlsx';
    link.click();
  };

  return null;
};

export default ExcelModifier;