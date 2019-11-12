import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';

import { TagSkusComponent } from './tag-skus/tag-skus.component';
import { TagBboxesComponent } from './tag-bboxes/tag-bboxes.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatTableModule} from '@angular/material/table';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatListModule} from '@angular/material/list';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatMenuModule} from '@angular/material/menu';
import {MatInputModule} from '@angular/material/input';
import {MatDividerModule} from '@angular/material/divider';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import {MatDialogModule} from '@angular/material/dialog';

import { CloudinaryModule } from '@cloudinary/angular-5.x';
import * as  Cloudinary from 'cloudinary-core';

import { FlexLayoutModule } from '@angular/flex-layout';
import { ProductImageZoomDialogComponent } from './product-image-zoom-dialog/product-image-zoom-dialog.component';
import { HttpClientModule } from '@angular/common/http';
import { ShelfImagesListItemComponent } from './shelf-images-list-item/shelf-images-list-item.component';
import { ShelfImageDetailComponent } from './shelf-image-detail/shelf-image-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    TagSkusComponent,
    TagBboxesComponent,
    TopBarComponent,
    ProductImageZoomDialogComponent,
    ShelfImagesListItemComponent,
    ShelfImageDetailComponent,
  ],
  entryComponents: [
    ProductImageZoomDialogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatGridListModule,
    MatTableModule,
    MatCheckboxModule,
    MatListModule,
    MatCardModule,
    MatIconModule,
    ScrollingModule,
    MatPaginatorModule,
    CloudinaryModule.forRoot(Cloudinary, {cloud_name: 'dogwmabtw'}),
    FlexLayoutModule,
    MatMenuModule,
    MatInputModule,
    MatDividerModule,
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    NgxMatSelectSearchModule,
    ReactiveFormsModule,
    MatDialogModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
