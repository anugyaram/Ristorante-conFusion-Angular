import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/comment';



@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})


export class DishdetailComponent implements OnInit {

  autoTicks = false;
  disabled = false;
  invert = false;
  max = 5;
  min = 1;
  showTicks = false;
  step = 1;
  thumbLabel = true;
  value = 5;
  vertical = false;
  tickInterval = 1;

  getSliderTickInterval(): number | 'auto' {
    if (this.showTicks) {
      return this.autoTicks ? 'auto' : this.tickInterval;
    }

    return 0;
  }
  @ViewChild('cForm', { static: false }) commentFormDirective;
    dish: Dish;
    dishIds: string[];
    prev: string;
    next: string;
    commentForm: FormGroup;
    comment: Comment;
    date: string;
    errMess: string;
    dishcopy: Dish;


    formErrors={
      'author': '',
      'rating': '',
      'comment': '',
    }
  
    validationMessages={
      'author':{
        'required': 'Author Name is required',
        'minlength': 'Author Name must be atleast 2 characters long',
        'maxlength': 'Author Name should not exceed 25 characters in length'
      },
      'rating':{
      },
      'comment':{
        'required': 'Comment shouldd not be empty.'
      }
    }
  
    constructor(private dishService: DishService,
                  private route: ActivatedRoute,
                  private location: Location,
                  private fb: FormBuilder, @Inject('BaseURL') public baseURL) {
      this.createForm();
    }
  
    ngOnInit(): void {
      this.dishService.getDishIds()
          .subscribe((dishIds)=> {this.dishIds=dishIds});
      this.route.params
          .pipe(switchMap((params: Params) => this.dishService.getDish(params['id'])))
          .subscribe((dish)=> {
              this.dish= dish; 
              this.dishcopy = dish;
              this.setPrevNext(this.dish.id);
          }, errmess => this.errMess = <any>errmess);
    }
  
    setPrevNext(dishId: string){
      const index= this.dishIds.indexOf(dishId);
      this.prev= this.dishIds[(this.dishIds.length + index-1)%this.dishIds.length];
      this.next= this.dishIds[(this.dishIds.length + index+1)%this.dishIds.length];
    }
  
    goBack(): void {
      this.location.back();
    }
  
    createForm(){
      this.commentForm=this.fb.group({
        author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25),]],
        rating: [5],
        comment: ['', [Validators.required,]],
        date: ['']
      });
      this.commentForm.valueChanges
        .subscribe(data=> this.onValueChanged(data));
      
      this.onValueChanged();
    }
  
    onValueChanged(data?: any){
      if(!this.commentForm){return ;}
      const form= this.commentForm;
      for (const field in this.formErrors){
        if(this.formErrors.hasOwnProperty(field)){
          this.formErrors[field]='';  //clear previous error messages, if any
          const control= form.get(field)
          if (control && control.dirty && !control.valid){
            const messages= this.validationMessages[field];
            for(const key in control.errors){
              if(control.errors.hasOwnProperty(key)){
                this.formErrors[field] += messages[key] + ' ';
              }
            }
          }
        }
      }
    }
  
  onSubmit(){
    this.comment= this.commentForm.value;
    this.comment.date = new Date().toISOString();
    console.log(this.comment);
    this.dishcopy.comments.push(this.comment);
    this.dishService.putDish(this.dishcopy).subscribe(dish => {
      this.dish = dish;
      this.dishcopy = dish;
    },errmess => { 
      this.dish = null;
      this.errMess = <any>errmess;
    });
    this.commentForm.reset({
      author: [' '],
      rating: 5,
      comment: [' '],
    });
    this.commentFormDirective.resetForm();
  }

}
