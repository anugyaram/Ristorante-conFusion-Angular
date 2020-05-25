import { Component, OnInit, Inject } from '@angular/core';
import { LeaderService} from '../services/leader.service';
import { Leader } from '../shared/leader';
import { flyInOut,expand } from '../animations/app.animation';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
  },
  animations:[
    flyInOut(),
    expand()
  ]
})
export class AboutComponent implements OnInit {

  leaders:Leader[];
  leadErrMess: string;

  constructor(private leaderservice:LeaderService,@Inject('BaseURL') public baseURL) { }

  ngOnInit() {
    this.leaderservice.getLeaders().subscribe((leader) => this.leaders = leader, errmess => this.leadErrMess = <any>errmess);
  }

}
