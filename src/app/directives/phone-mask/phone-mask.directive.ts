import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appPhoneMask]',
  standalone:true
})
export class PhoneMaskDirective {

  @Input() mask?: string;
  @Input('formControl') formControl?: any;

  constructor(private el: ElementRef) { }

  @HostListener('input', ['$event'])
  onInputChange(event:any) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Elimina cualquier carácter que no sea un número
    value = value.slice(0, this.mask!.length); // Limita la longitud del valor
    let maskedValue = '';
    let maskIndex = 0;
    for (let i = 0; i < value.length; i++) {
      maskedValue += value[i];
    }
    const regex = /(\d{3})(?=(\d{4})+$)/g;
    input.value = maskedValue.replace(regex, '$1 ');
    this.formControl.setValue("+"+input.value);
  }
}