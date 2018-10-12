import { Component, OnInit } from '@angular/core';

interface rowItem {
  key: string; value: string;
}

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})

export class ListComponent implements OnInit {

  nrOfHeaders;
  nrOfRowsPerPage;
  headers;
  rows;
  csvData;
  displayCsvData;
  rowKeys;
  availableIssueCounts;
  csvLoaded;
  dimmedRows;

  constructor() {
    this.nrOfHeaders = 4;
    this.nrOfRowsPerPage = 5;

    this.headers = new Array(this.nrOfHeaders);
    this.rows = new Array(this.nrOfRowsPerPage);
    this.rowKeys = [];
    this.dimmedRows = new Array(this.rows.length).fill(false);

    this.displayCsvData = new Array(this.nrOfRowsPerPage).fill(new Array(this.nrOfHeaders));
    this.csvData;

    this.availableIssueCounts = [1,2,3,4,5,6,7,8,9,10];
    this.csvLoaded = false;
    }

  ngOnInit() {
  }

  fileChangeListener($event): void {
    const input = $event.target;
    const fileReader = new FileReader();
    const csvStringDelimiter = ',';
    fileReader.readAsText(input.files[0]);

    fileReader.onload = (data) => {
      // read csv as string
      let csvData = fileReader.result;
      // split string on linebreaks and convert to stringarray
      let dataArray = csvData.split(/\r\n|\n/);
      // split first item of array on commas and convert item to stringarray - [[item1,item2,item3]]
      this.headers = dataArray[0]
        .split(csvStringDelimiter)
        .map(header => header.replace(/"/g, ''))
        .map(header => {
          let column = header
            .replace(/\b[a-z]/g, (char => '_' + char.toUpperCase()))
            .replace(/\s/g, '');
          return { key:column, value:header }
        });
      this.rowKeys = this.headers.map(header => header.key);
      // split remaining items of array on commas and convert to stringarray  - [[item1,item2,item3],[...],...]
      this.csvData = this.stringArray2ObjectArray(dataArray.slice(1), this.rowKeys, csvStringDelimiter);
      // we need deep copy that can be independently mutated 
      this.displayCsvData = this.csvData.map(row => row.map(ob => ({...ob})));
      this.csvLoaded = true;  
    }
  }

  stringArray2ObjectArray(stringArray, keys, delimiter): string[][] {
    let i = 0;

    return stringArray.map((stringOfStrings) => {
      return stringOfStrings.split(delimiter)
        .map(string => {
          i = i >= keys.length ? 0 : i;
          let column = keys[i++];
          string = string.replace(/"/g, '');
          return { key:column, value:string }
        });
    });
  }

  onChangeIssueCount(newCount) {
    newCount = parseInt(newCount);
    this.dimmedRows = this.csvData.map(row => row.some(rowItem => rowItem.key == 'Issue_Count' && parseInt(rowItem.value) < newCount))
    this.dimmedRows = this.dimmedRows.concat(new Array(this.rows.length - this.displayCsvData.length).fill(false))    

    // const filterByIssueCount = (rows: Array<rowItem[]>, issueCount: number): Array<rowItem[]> => {
    //   return rows.filter(row => row
    //     .some(rowItem => rowItem.key == 'Issue_Count' && parseInt(rowItem.value) < newCount)
    //     )
    // }

    // this.displayCsvData = filterByIssueCount(this.csvData, newCount);

  }


}
