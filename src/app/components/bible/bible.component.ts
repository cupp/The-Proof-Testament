import { Component, OnInit, AfterContentChecked, Output, EventEmitter, OnDestroy } from '@angular/core';
import { BibleService } from './bible.service';
import {Theorem} from '../../model/theorem';
import {ElementRef, ViewChild} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {EmptyObservable} from 'rxjs/observable/EmptyObservable';

@Component({
  selector: 'app-bible',
  templateUrl: './bible.component.html',
  styleUrls: ['./bible.component.scss']
})
export class BibleComponent implements OnInit, OnDestroy {

  pageSize = 10;
  private pageSizeSubscription;
  allTheorems: Theorem[];
  filtered: Theorem[];
  private thmSubscription;
  private thmFirstSubscription;
  private thmUpdateSubscription;
  private fieldEmptySubscription;
  @ViewChild('theoremList') elementView: ElementRef;
  @Output() secondClickEvent = new EventEmitter();

  constructor(private service: BibleService) {
    this.pageSizeSubscription = this.service.pageSize$.subscribe(num => {
      this.pageSize = num;
      this.thmUpdateSubscription = this.service.updateTheoremCount(num).subscribe(thm => {
        this.filtered = thm;
      });
      console.log('page size updated to: ' + num);
    });
  }

  ngOnInit() {
    this.thmSubscription = this.service.findAllTheorems()
      .subscribe(
        theorems => {
          this.allTheorems = theorems;
        }
      );
    this.thmFirstSubscription = this.service.fillFirstTheorems()
      .subscribe(
        theorems => {
          this.filtered = theorems;
        }
      );
  }

  ngOnDestroy() {
    this.thmSubscription.unsubscribe();
    this.pageSizeSubscription.unsubscribe();
    this.thmFirstSubscription.unsubscribe();
    if (this.thmUpdateSubscription) {
      this.thmUpdateSubscription.unsubscribe();
    }
    if (this.fieldEmptySubscription) {
      this.fieldEmptySubscription.unsubscribe();
    }
  }

  search(search: string) {
    if (search === '') {
      this.fieldEmptySubscription = this.service.fillFirstTheorems()
        .subscribe(
          theorems => {
            this.filtered = theorems;
          }
        );
    }
    this.filtered = this.allTheorems.filter(theorem =>
      theorem.rule.includes(search) ||
       (theorem.name && theorem.name.toLowerCase().includes(search.toLowerCase())
    ));
  }

  insertIntoEditorComp(name) {
    this.secondClickEvent.emit(name);
  }

}
