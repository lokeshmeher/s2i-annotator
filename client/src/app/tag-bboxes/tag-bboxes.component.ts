import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ShelfImagesService } from '../shelf-images.service'
import { PageEvent, MatPaginator } from '@angular/material';
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject ,  Observable } from 'rxjs';
// import 'rxjs/add/observable/merge';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-tag-bboxes',
  templateUrl: './tag-bboxes.component.html',
  styleUrls: ['./tag-bboxes.component.css']
})
export class TagBboxesComponent implements OnInit {

  shelfImages = []
  shelfImagesCount = 0
  currImage = null
  currImageIndex = 0

  length = 0;
  pageIndex = 0;
  pageSize = 10;
  database: Database;
  pageEvent: PageEvent;
  dataSource : MyDataSource;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private shelfImagesService: ShelfImagesService
  ) { }

  ngOnInit() {
    this._loadPage(this.pageIndex, this.pageSize)
  }

  _loadPage(pageIndex, pageSize) {
    this.shelfImagesService.getItems(pageIndex*pageSize, pageSize).subscribe(data => {
      this.shelfImages = data.data;
      this.length = this.shelfImages.length;
      this.database = new Database(this.shelfImages);
      this.dataSource = new MyDataSource(this.database, this.paginator);
      this.shelfImagesCount = data.totalCount
      this.currImage = this.shelfImages[0]
    });
  }

  pageChange(event) {
    const { pageIndex, pageSize } = event
    this._loadPage(pageIndex, pageSize)
  }

  setAllReviewed() {
    if (this.shelfImages.length) {
      const data = this.shelfImages.map(item => ({
        'id': item.id, 'reviewStatus': 'reviewed'
      }))
      this.shelfImagesService.bulkUpdate(data).subscribe(data => {
        this.shelfImages = data
      })
    }
  }

  setAllToReview() {
    if (this.shelfImages.length) {
      const data = this.shelfImages.map(item => ({
        'id': item.id, 'reviewStatus': 'to-review'
      }))
      this.shelfImagesService.bulkUpdate(data).subscribe(data => {
        this.shelfImages = data
      })
    }
  }

  setCurrentImage(event, idx) {
    this.currImage = event
    this.currImageIndex = idx
  }

  showPrevNext(event) {
    if (event === 'prev') {
      this.currImage = this.shelfImages[this.currImageIndex-1]
      this.currImageIndex -= 1
    }
    else if (event === 'next') {
      this.currImage = this.shelfImages[this.currImageIndex+1]
      this.currImageIndex += 1
    }
  }
}

export class Database {
  /** Stream that emits whenever the data has been modified.*/
  dataChange: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  
  get data(): any[] { return this.dataChange.value; }
  
  constructor(data) {
    // Fill up the database .
    this.dataChange.next(data);
  }
  
  getChange(data){
    this.dataChange.next(data);
  }
}

export class MyDataSource extends DataSource<any> {
  /** Stream of data that is provided to the table. */
  constructor(
    private dataBase: Database,
    private paginator: MatPaginator
  ) {
    super();
  }
  
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<any[]> {
    //To handle data change event or paginator page change event
    const displayDataChanges = [
      this.dataBase.dataChange,
      this.paginator.page
    ];
    
    return Observable.merge(displayDataChanges).pipe(
      map(() => {
        let data;
        
        this.dataBase.dataChange.subscribe(xdata => {
          data = Object.values(xdata);
        });
    
      // Grab the page's slice of data.
      const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
      const finalData = data.splice(startIndex, this.paginator.pageSize);
      return finalData;
    }));
  }
  
  disconnect() {}
}