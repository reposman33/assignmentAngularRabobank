import { Component, OnInit } from '@angular/core';

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
  rowKeys;
  availableIssueCounts;
  csvLoaded;
  dimmedRows;

  constructor() {
    this.nrOfHeaders = 4;
    this.nrOfRowsPerPage = 5;

    // contains the name of the headersof the csv file
    this.headers = new Array(this.nrOfHeaders);
    // contains the name of the headersof the csv file
    this.rows = new Array(this.nrOfRowsPerPage);
    // contains normalized column names used as keys
    this.rowKeys = [];
    // array to keep track which rows should not be visible
    this.dimmedRows = new Array(this.rows.length).fill(false);

    this.csvData;

    // iterable needed to dynamically build options in select
    // https://stackoverflow.com/questions/48393353/angular-ngfor-without-an-iterable-need-to-build-the-iterable
    this.availableIssueCounts = [1,2,3,4,5,6,7,8,9,10];
    // needed to access csv data in template conditionally
    this.csvLoaded = false;
    }

  ngOnInit() {
  }

  /**
   * fileChangeListener
   * @description: called when user selects a file from local fileSystem
   * @param $event
   * @return void 
   */
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
        // remove double quote
        .map(header => header.replace(/"/g, ''))
        .map(header => {
          // convert column names to snake case
          let column = header
            .replace(/\b[a-z]/g, (char => '_' + char.toUpperCase()))
            .replace(/\s/g, '');
            // e.g. {key:'Sur_Name', value:'Marc Bakker'}
          return { key:column, value:header }
        });
        // retrieve the columnkeys for easy access in stringArray2ObjectArray  
      this.rowKeys = this.headers.map(header => header.key);
      // split remaining items of array on commas and convert to stringarray  - [[item1,item2,item3],[...],...]
      this.csvData = this.stringArray2ObjectArray(dataArray.slice(1), this.rowKeys, csvStringDelimiter);
      // triggers template to display date
      this.csvLoaded = true;  
    }
  }

  /**
   * stringArray2ObjectArray
   * @param {Array} stringArray: array of stringarrays containing strings - [[str1,str2,str3],...]
   * @param {Array} keys: array of keys identifying column values
   * @param {String} delimiter: the delimiter that delimits the items in the string arrays
   * @return {Array} an object Array
  */
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

  /**
   * onChangeIssueCount
   * @description callback for dropdown issueCount
   * @param {number} newCount: number of issues
   * @return void
   * */
  onChangeIssueCount(newCount) {
    // html input is string, convert to number
    newCount = parseInt(newCount);
    this.dimmedRows = this.csvData.map(row => row.some(rowItem => rowItem.key == 'Issue_Count' && parseInt(rowItem.value) < newCount))
    this.dimmedRows = this.dimmedRows.concat(new Array(this.rows.length - this.csvData.length).fill(false))    
  }

}
