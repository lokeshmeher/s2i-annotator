import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-product-image-zoom-dialog',
  templateUrl: './product-image-zoom-dialog.component.html',
  styleUrls: ['./product-image-zoom-dialog.component.css']
})
export class ProductImageZoomDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
  }

}
