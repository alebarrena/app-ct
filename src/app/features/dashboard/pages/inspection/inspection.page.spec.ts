import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InspectionPage } from './inspection.page';

describe('InspectionPage', () => {
  let component: InspectionPage;
  let fixture: ComponentFixture<InspectionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InspectionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
