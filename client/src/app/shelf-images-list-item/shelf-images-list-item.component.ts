import { Component, OnInit, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
import { ShelfImagesService } from '../shelf-images.service'
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-shelf-images-list-item',
  templateUrl: './shelf-images-list-item.component.html',
  styleUrls: ['./shelf-images-list-item.component.css']
})
export class ShelfImagesListItemComponent implements OnInit {
  @Input() image;
  productImagesCount: Observable<any> =  of(0);

  @Output() itemClicked = new EventEmitter();

  constructor(
    private shelfImagesService: ShelfImagesService
  ) { }

  ngOnInit() {
    this.productImagesCount = this.shelfImagesService.getProductImagesCount(this.image.id)
  }

  listItemClicked(item) {
    this.itemClicked.emit(item)
  }

}
