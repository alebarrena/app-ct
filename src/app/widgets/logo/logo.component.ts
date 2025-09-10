import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss'],
  standalone:true,
})
export class LogoComponent  implements OnInit {
  @Input('size') size = 150;
  constructor() { }

  ngOnInit() {}

}
