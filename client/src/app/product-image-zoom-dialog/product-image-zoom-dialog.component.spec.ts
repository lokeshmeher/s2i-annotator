import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductImageZoomDialogComponent } from './product-image-zoom-dialog.component';

describe('ProductImageZoomDialogComponent', () => {
  let component: ProductImageZoomDialogComponent;
  let fixture: ComponentFixture<ProductImageZoomDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductImageZoomDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductImageZoomDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
