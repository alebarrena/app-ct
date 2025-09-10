import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PoliciesPage } from './policies.page';

describe('PoliciesPage', () => {
  let component: PoliciesPage;
  let fixture: ComponentFixture<PoliciesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PoliciesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
