import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import {debounceTime, delay, tap, filter, map, takeUntil} from 'rxjs/operators';
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { ProductImageZoomDialogComponent } from '../product-image-zoom-dialog/product-image-zoom-dialog.component';

export interface Bank {
  id: string;
  name: string;
}

export interface BankGroup {
  name: string;
  banks: Bank[];
}


/** list of banks */
export const BANKS: Bank[] = [
  {name: 'Bank A (Switzerland)', id: 'A'},
  {name: 'Bank B (Switzerland)', id: 'B'},
  {name: 'Bank C (France)', id: 'C'},
  {name: 'Bank D (France)', id: 'D'},
  {name: 'Bank E (France)', id: 'E'},
  {name: 'Bank F (Italy)', id: 'F'},
  {name: 'Bank G (Italy)', id: 'G'},
  {name: 'Bank H (Italy)', id: 'H'},
  {name: 'Bank I (Italy)', id: 'I'},
  {name: 'Bank J (Italy)', id: 'J'},
  {name: 'Bank Kolombia (United States of America)', id: 'K'},
  {name: 'Bank L (Germany)', id: 'L'},
  {name: 'Bank M (Germany)', id: 'M'},
  {name: 'Bank N (Germany)', id: 'N'},
  {name: 'Bank O (Germany)', id: 'O'},
  {name: 'Bank P (Germany)', id: 'P'},
  {name: 'Bank Q (Germany)', id: 'Q'},
  {name: 'Bank R (Germany)', id: 'R'}
];

/** list of bank groups */
export const BANKGROUPS: BankGroup[] = [
  {
    name: 'Switzerland',
    banks: [
      {name: 'Bank A', id: 'A'},
      {name: 'Bank B', id: 'B'}
    ]
  },
  {
    name: 'France',
    banks: [
      {name: 'Bank C', id: 'C'},
      {name: 'Bank D', id: 'D'},
      {name: 'Bank E', id: 'E'},
    ]
  },
  {
    name: 'Italy',
    banks: [
      {name: 'Bank F', id: 'F'},
      {name: 'Bank G', id: 'G'},
      {name: 'Bank H', id: 'H'},
      {name: 'Bank I', id: 'I'},
      {name: 'Bank J', id: 'J'},
    ]
  },
  {
    name: 'United States of America',
    banks: [
      {name: 'Bank Kolombia', id: 'K'},
    ]
  },
  {
    name: 'Germany',
    banks: [
      {name: 'Bank L', id: 'L'},
      {name: 'Bank M', id: 'M'},
      {name: 'Bank N', id: 'N'},
      {name: 'Bank O', id: 'O'},
      {name: 'Bank P', id: 'P'},
      {name: 'Bank Q', id: 'Q'},
      {name: 'Bank R', id: 'R'}
    ]
  }
];

@Component({
  selector: 'app-tag-skus',
  templateUrl: './tag-skus.component.html',
  styleUrls: ['./tag-skus.component.css']
})
export class TagSkusComponent implements OnInit {
  searchText: string = ''
  skus = Array.from({length: 1000}).map((item, idx) => ({
    "brand": "STARBUCKS",
    "brand_variant": "VIA INSTANT COLOMBIA 100% ARABICA INSTANT AND MICROGROUND COFFEE",
    "comment": "",
    "pack_count": "1 PACK",
    "price": "5.38",
    "product_count": "8 COUNT",
    "promotion": "",
    "shape": "POUCH",
    "size": "0.93 OZ",
    "upc": "999999823888",
    "view": ""
  }))

  sku = {
    "brand": "STARBUCKS",
    "brand_variant": "VIA INSTANT COLOMBIA 100% ARABICA INSTANT AND MICROGROUND COFFEE",
    "comment": "",
    "pack_count": "1 PACK",
    "price": "5.38",
    "product_count": "8 COUNT",
    "promotion": "",
    "shape": "POUCH",
    "size": "0.93 OZ",
    "upc": "999999823888",
    "view": ""
  }

  counts = {
    toReview: 55,
    reviewed: 0,
    total: 55
  }

  images = Array.from({length: 24}).map(() => ({
    "bbox": {
      "h": 190,
      "w": 208,
      "x": 1841,
      "y": 785
    },
    "crop": {
      "h": 380,
      "w": 416,
      "x": 1737,
      "y": 690
    },
    "id": "shelf_images/prod_1981639e-c097-4690-b32f-ed1ef57b583d--1841-785-208-190--1737-690-416-380",
    "reviewStatus": "to-review",
    "shelfImage": {
      "id": "shelf_images/prod_1981639e-c097-4690-b32f-ed1ef57b583d",
      "url": "http://res.cloudinary.com/dogwmabtw/image/upload/v1573225298/shelf_images/prod_1981639e-c097-4690-b32f-ed1ef57b583d.jpg"
    },
    "upc": "999999823902"
  }))

  dialogImage = null

  /** list of banks */
  protected banks: Bank[] = BANKS;

  /** control for the selected bank for server side filtering */
  public bankServerSideCtrl: FormControl = new FormControl();

  /** control for filter for server side. */
  public bankServerSideFilteringCtrl: FormControl = new FormControl();

  /** indicate search operation is in progress */
  public searching: boolean = false;

  /** list of banks filtered after simulating server side search */
  public  filteredServerSideBanks: ReplaySubject<Bank[]> = new ReplaySubject<Bank[]>(1);

  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();

  constructor(
    public dialog: MatDialog
  ) { }

  openZoomDialog() {
    const dialogRef = this.dialog.open(ProductImageZoomDialogComponent, {
      data: this.dialogImage,
    });

    dialogRef.afterClosed().subscribe(result => {
      this.dialogImage = null
    });
  }

  ngOnInit() {
    // listen for search field value changes
    this.bankServerSideFilteringCtrl.valueChanges
      .pipe(
        filter(search => !!search),
        tap(() => this.searching = true),
        takeUntil(this._onDestroy),
        debounceTime(200),
        map(search => {
          if (!this.banks) {
            return [];
          }

          // simulate server fetching and filtering data
          return this.banks.filter(bank => bank.name.toLowerCase().indexOf(search) > -1);
        }),
        delay(500)
      )
      .subscribe(filteredBanks => {
        this.searching = false;
        this.filteredServerSideBanks.next(filteredBanks);
      },
        error => {
          // no errors in our simulated example
          this.searching = false;
          // handle error...
        });
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

}
