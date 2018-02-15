import {Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, ViewContainerRef, ComponentFactoryResolver} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

import { QuillEditorComponent } from 'ngx-quill/src/quill-editor.component';
import { AutocompleteBoxComponent } from '../autocomplete-box/autocomplete-box.component';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

import Quill from 'quill';

// // override p with div tag
// const Parchment = Quill.import('parchment');
// let Block = Parchment.query('block');
//
// Block.tagName = 'DIV';
// // or class NewBlock extends Block {}; NewBlock.tagName = 'DIV';
// Quill.register(Block /* or NewBlock */, true);
// //
// // import Counter from './counter';
// // Quill.register('modules/counter', Counter)


@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  encapsulation: ViewEncapsulation.None
})


export class EditorComponent implements OnInit {

  @ViewChild('autoCompleteContainer', {read: ViewContainerRef}) viewContainerRef: ViewContainerRef;

  title = '<p> Prove: </p> ' +
    '<p> Description: By ... </p> ' +
    '<br> Proof: <br> ' +
    '<p> /≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩#~⋅*∘∙÷×Ρ↓↑◃▹★∀∃⋁⋀+-^ </p>';
    isReadOnly = false;
    placeholder = 'placeholder';
    form: FormGroup;
    modules = {};

    constructor(fb: FormBuilder, private factoryResolver: ComponentFactoryResolver) {
      this.form = fb.group({
        editor: ['test']
      });

      this.modules = {
        formula: true,
        toolbar: [[{ 'indent': '-1'}, { 'indent': '+1' }], ['formula']]
      };
  }

  @ViewChild('editor') editor: QuillEditorComponent;

  ngOnInit() {
    this.form
      .controls
      .editor
      .valueChanges
      .debounceTime(400)
      .distinctUntilChanged()
      .subscribe(data => {
        console.log('native fromControl value changes with debounce', data);
      });

    this.editor
      .onContentChanged.debounceTime(400)
      .distinctUntilChanged()
      .subscribe(data => {
        console.log('view child + directly subscription', data);
      });
    }

    keyPressed() {
      console.log('TEST WORKED');
      const factory = this.factoryResolver.resolveComponentFactory(AutocompleteBoxComponent);
      const ref = this.viewContainerRef.createComponent(factory);
      ref.changeDetectorRef.detectChanges();
    }

    addBindingCreated(quill) {
      //BINDINGS FOR RULE SYMBOLS
      //padded after the symbol
      quill.keyboard.addBinding({ key: 'e' }, {
          collapsed: true,
          prefix: /^=$/,
          offset: 1,
      },
       (range, context) => {
         quill.deleteText(range.index - 1, 1); // range.index-1 = user's cursor -1 -> where = character is
         quill.insertText(range.index - 1, '=            <>');
      });

      quill.keyboard.addBinding({ key: 'l' }, {
          collapsed: true,
          prefix: /^=$/,
          offset: 1,
      },
       (range, context) => {
         quill.deleteText(range.index - 1, 1); // range.index-1 = user's cursor -1 -> where = character is
         quill.insertText(range.index - 1, '<            <>');
      });

      quill.keyboard.addBinding({ key: 'g' }, {
          collapsed: true,
          prefix: /^=$/,
          offset: 1,
      },
       (range, context) => {
         quill.deleteText(range.index - 1, 1); // range.index-1 = user's cursor -1 -> where = character is
         quill.insertText(range.index - 1, '>            <>');
      });

      //not padded after the symbol
      quill.keyboard.addBinding({ key: 'i' }, {
          collapsed: true,
          prefix: /^=$/,
          offset: 1,
      },
      (range, context) => {
         quill.deleteText(range.index - 1, 1); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 1, '⇒          <>');
      });

      quill.keyboard.addBinding({ key: 'f' }, {
          collapsed: true,
          prefix: /^=$/,
          offset: 1,
      },
       (range, context) => {
         quill.deleteText(range.index - 1, 1); // range.index-1 = user's cursor -1 -> where = character is
         quill.insertText(range.index - 1, '⇐          <>');
      });

    }

    setControl() {
      this.form.setControl('editor', new FormControl('test - new Control'));
    }

    setFocus($event) {
      $event.focus();
    }

    logChange($event: any) {
      console.log($event);
    }

    logSelection($event: any) {
      console.log($event);
    }

  }
