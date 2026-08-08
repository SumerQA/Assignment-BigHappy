import * as XLSX from 'xlsx';
import path from 'path';

export class ExcelReader {
  static getData(fileName: string, sheetName: string) {
    const filePath = path.join(__dirname, '../test-data', fileName);
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet);
  }
  static filterRunnable(data: any[]) {
    return data.filter(row => row.run === 'Y');
  }
}