import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { Swiper, SwiperOptions } from 'swiper/types';
import { A11y, Mousewheel, Navigation, Pagination } from 'swiper/modules';
import { OnboardService } from '../../service/onboard.service';
import { Router } from '@angular/router';
import { TranslationPipe } from 'src/app/helpers/translation/translation.pipe';

@Component({
  selector: 'app-onboard',
  templateUrl: './onboard.page.html',
  styleUrls: ['./onboard.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,TranslationPipe
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class OnboardPage implements OnInit {
  @ViewChild('swiperRef', { static: true })
  protected _swiperRef: ElementRef | undefined;
  swiper?: Swiper;
  page = 1;
  public config: SwiperOptions = {
    modules: [Navigation, Pagination, A11y, Mousewheel],
    spaceBetween: 0,
    navigation: false,
    injectStyles: [
      `
     .swiper-pagination-bullet {
    opacity: 1;
    transition: all 300ms;
    border-radius:5px;
    width:33px;
    background-color:#E8E7EE;
}
 .swiper-pagination-bullet-active {
    background-color: #FF5E01;
    width:50px;
}
    .swiper-horizontal>.swiper-pagination-bullets, .swiper-pagination-bullets.swiper-pagination-horizontal, .swiper-pagination-custom, .swiper-pagination-fraction{
    width: 50%;    top: 170px;
    }
      `,
    ],
    pagination: {
      clickable: true,
    },
    centeredSlides: true,
    
  };
  constructor(private onboardService:OnboardService,private router:Router ) {

    this.onboardService.checkOnboard$.subscribe((data) => {
      if(data){
         this.router.navigate(['/'],{replaceUrl:true})
        //window.location.href = "/";
      }
    });
  }

  ngOnInit() {
    const swiperEl = this._swiperRef!.nativeElement;
    Object.assign(swiperEl, this.config);

    swiperEl.initialize();

    if (this.swiper) this.swiper.currentBreakpoint = false; // Breakpoint fixes
    this.swiper = this._swiperRef!.nativeElement.swiper;

    this.swiper!.off('slideChange'); // Avoid multiple subscription, in case you wish to call the `_initSwiper()` multiple time

    this.swiper!.on('slideChange', (swiper) => {
      // Any change subscription you wish
      this.page = (swiper.realIndex+1);
    });
  }
  next(){
    if(this.page<3){
      this._swiperRef!.nativeElement.swiper.slideNext();
    }
    else{
      this.onboardService.init();
    }
  }
  skip(){
    this.onboardService.init();
  }

}
