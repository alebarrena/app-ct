import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdvancePage } from './advance.page';

describe('AdvancePage', () => {
  let component: AdvancePage;
  let fixture: ComponentFixture<AdvancePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
