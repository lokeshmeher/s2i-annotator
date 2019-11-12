import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagSkusComponent } from './tag-skus.component';

describe('TagSkusComponent', () => {
  let component: TagSkusComponent;
  let fixture: ComponentFixture<TagSkusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagSkusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagSkusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
