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
    const addressParts = data.address.split(',').map(part => part.trim());
    let addressLine1 = '';
    let addressLine2 = '';
    let addressLine3 = '';
  
    if (addressParts.length > 2) {
      addressLine1 = addressParts.slice(0, 2).join(', ') + ',';
      addressLine2 = addressParts.slice(2, 4).join(', ') + ',';
      addressLine3 = addressParts.slice(4).join(', ');
    } else {
      addressLine1 = data.address;
    }
  

  
    setColumnWidth('I', 13);
    setColumnWidth('K', 13);
    setColumnWidth('O', 15);
  
    modifyCell('C4', data.formData.companyName, 17, true);
    modifyCell('H20', `${data.invoicePeriodFrom} to ${data.invoicePeriodTo}`, 12);
    const projectIndex = data.project.indexOf(' and ');
    if (projectIndex !== -1) {
      const firstPart = data.project.substring(0, projectIndex);
      const secondPart = data.project.substring(projectIndex + 5); 
      modifyCell('C20', firstPart, 12); 
      modifyCell('C21', secondPart, 12);
    } else {
      // No 'and' in the string, just set the whole project in C20
      modifyCell('C20', data.project, 12);
    }
    modifyCell('C6', 'GST: ' + data.gst, 14, true);
    modifyCell('C5', 'PAN: ' + data.pan, 14, true);
    modifyCell('K13', addressLine1, 13);
    modifyCell('K14', addressLine2, 13);
    modifyCell('K15', addressLine3, 13);  
    const calcValue = parseFloat((data.issued * data.netRate).toFixed(4));
    const calcValueWithRate = parseFloat((calcValue * 0.09).toFixed(4));
    const o38Value = calcValue + 2 * calcValueWithRate;
    modifyCell('G31', calcValue, 14);
    modifyCell('I31', calcValueWithRate, 14);
    modifyCell('K31', calcValueWithRate, 14);
    modifyCell('G37', calcValue, 14, true);
    modifyCell('I37', calcValueWithRate, 14, true);
    modifyCell('K37', calcValueWithRate, 14, true);
    modifyCell('O38', parseFloat((calcValue + 2 * calcValueWithRate).toFixed(4)), 14, true);
    modifyCell('C31', `Purchase of renewable attributes for I-REC (${data.issued} units at INR ${data.netRate} per unit)`, 14);
    modifyCell('K9', `Date of Invoice: ${data.date}`, 14, true);
    modifyCell('K10', `Serial No. of Invoice: ${data.invoiceid}`, 14, true);


   
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