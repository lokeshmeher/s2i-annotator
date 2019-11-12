import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShelfImagesListItemComponent } from './shelf-images-list-item.component';

describe('ShelfImagesListItemComponent', () => {
  let component: ShelfImagesListItemComponent;
  let fixture: ComponentFixture<ShelfImagesListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShelfImagesListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShelfImagesListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
