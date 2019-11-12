import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges,
  ElementRef,
  ViewChild,
  AfterViewChecked} from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import { buffer, expand, reduce } from 'rxjs/operators'
import { ShelfImagesService } from '../shelf-images.service'
import { addCanvas } from '../../util'

@Component({
  selector: 'app-shelf-image-detail',
  templateUrl: './shelf-image-detail.component.html',
  styleUrls: ['./shelf-image-detail.component.css']
})
export class ShelfImageDetailComponent implements OnInit, OnChanges, AfterViewChecked {
  @Input() image: any;
  @Input() disablePrev: boolean;
  @Input() disableNext: boolean;
  
  @Output() onPrevNext = new EventEmitter()

  @ViewChild('imgElem') imgRef: ElementRef
  @ViewChild('imgElemParent') imgParentRef: ElementRef
  
  bboxes = []
  skip: number = 0;
  limit: number = 100;
  timeoutId = null;
  
  // result = new Subject();
  // closeBuffer = new Subject();
  // buffer = buffer(this.closeBuffer.asObservable())(this.result);

  constructor(
    private shelfImagesService: ShelfImagesService
  ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.skip = 0
    this.shelfImagesService.getBboxes(this.image.id, this.skip, this.limit)
      .pipe(
        expand(data => {
          this.skip += this.limit
          return data && data.length && data.length == this.limit ? this.shelfImagesService.getBboxes(this.image.id, this.skip, this.limit) : []
        }),
        reduce((acc, data) => acc.concat(data), [])
      )
      .subscribe(val => {
        this.bboxes = val
      })
    
    this.timeoutId = setTimeout(() => {
      // addCanvas(this.imgRef.nativeElement, this.bboxes, this.imgParentRef.nativeElement)
      console.log(this.imgRef.nativeElement)
    }, 500)
  }

  ngOnDestroy() {
    clearTimeout(this.timeoutId)
  }
}
