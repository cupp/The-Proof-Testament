import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
  ViewContainerRef,
  ComponentFactoryResolver
} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Observable} from 'rxjs/Observable';

import {QuillEditorComponent} from 'ngx-quill/src/quill-editor.component';

import {Symbols} from '../../model/symbols';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

import * as QuillNamespace from 'quill';

const Quill: any = QuillNamespace;

import {SymbolPickerService} from '../symbol-picker/symbol-picker.service';
import {EditorService} from './editor.service';

import {convert} from '../../convert/convert';

import {AntlrComponent} from '../antlr/antlr.component';
import {PDFTeX} from './pdftex/pdftex';

import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class EditorComponent implements OnInit, OnDestroy {

  @ViewChild('autoCompleteContainer', {read: ViewContainerRef}) viewContainerRef: ViewContainerRef;

  keys = Object.keys;
  symbols = Symbols;

  editorInstance: any;
  previousEditorSelection: any;
  infoFilled: boolean;
  private infoFilledSubscription;
  outline: string;
  private outlineSubscription;
  hideSymbols = true;
  private hideSymbolsSubscription;
  isReadOnly = false;
  form: FormGroup;
  modules = {};

  equalsUnicode = '\u003D';
  impliesUnicode = '\u21D2';
  followsFromUnicode = '\u21d0 ';
  lessThanUnicode = '\u003C';
  greaterThanUnicode = '\u003E';
  doesNotEqualUnicode = '\u2260';
  leftBracketUnicode = '\u3008';
  rightBracketUnicode = '\u3009';
  hintUnicode = '          ' + this.leftBracketUnicode + '  ' + this.rightBracketUnicode;
  textSubUnicode = '\u2254';
  genQuantifierUnicode = '\u2605';
  lessThanOrEqUnicode = '\u2264';
  greaterThanOrEqUnicode = '\u2265';
  elementOfUnicode = '\u2208';
  notElementOfUnicode = '\u2209';
  properSubsetOfUnicode = '\u2282';
  subsetOfUnicode = '\u2286';
  properSupersetOfUnicode = '\u2283';
  supersetOfUnicode = '\u2287';
  notProperSubsetOfUnicode = '\u2284';
  notSubsetOf = '\u2289';
  notProperSupersetOfUnicode = '\u2285';
  notSupersetOfUnicode = '\u2289';
  unionUnicode = '\u222a';
  intersectionUnicode = '\u2229';
  emptySetUnicode = '\u2205';
  conjuctionUnicode = '\u22c0';
  disjunctionUnicode = '\u22c1';
  equivalesUnicode = '\u2261';
  notEquivalesUnicode = '\u2262';
  doesNotImplyUnicode = '\u21cf';
  doesNotFollowFromUnicode = '\u21cd';
  universalQuantifierUnicode = '\u2200';
  existentialQuanitiferUnicode = '\u2203';
  endProofUnicode = '\u2571';
  integerUnicode = '\u2124';
  naturalUnicode = '\u2115';
  rationalUnicode = '\u211a';
  realUnicode = '\u211d';
  nextUnicode = '\u25cb';
  untilUnicode = '\u02af';
  alwaysUnicode = '\u25a1';
  eventuallyUnicode = '\u25c7';
  booleanSymbol = '𝔹';
  plusUnicode = '\u002B';


  bindings = {
    enter: {
      key: 13,
      handler: () => {
        this.hideSymbols = false;
        this.editorInstance.insertText(this.editorInstance.getSelection(), '\n     ');
        this.previousEditorSelection = this.editorInstance.getSelection();
      }
    }
  };


  constructor(fb: FormBuilder,
              private factoryResolver: ComponentFactoryResolver,
              private symbolService: SymbolPickerService,
              private editorService: EditorService,
              private http: HttpClient) {

    this.infoFilledSubscription = this.editorService.infoFilledChange.subscribe(infoFilled => {
      this.infoFilled = infoFilled;
    });

    this.outlineSubscription = this.editorService.outlineChange.subscribe(outline => {
      this.outline = outline;
    });

    this.hideSymbolsSubscription = this.editorService.hideSymbolsChange.subscribe(hideSymbols => {
      this.hideSymbols = hideSymbols;
    });

    this.form = fb.group({
      editor: ['test']
    });

    this.modules = {
      keyboard: {
        bindings: this.bindings
      },
      formula: true,
      toolbar: true,
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

  }

  ngOnDestroy() {
    this.infoFilledSubscription.unsubscribe();
    this.outlineSubscription.unsubscribe();
    this.hideSymbolsSubscription.unsubscribe();
  }

  generateSymbolShortcut(symbolIdentifier) {
    let symbolShortcut = '';

    switch (symbolIdentifier) {
      case 'not': {
        symbolShortcut = ';er';
        break;
      }
      default: {
        console.log('symbol could not be identified');
        break;
      }
    }

    return symbolShortcut;
  }

  insertSymbol(selectedVal) {
    this.editorInstance.insertText(this.previousEditorSelection, selectedVal.substring(0, selectedVal.length - 15));
    this.editorInstance.setSelection(this.previousEditorSelection.index + selectedVal.length + 1);
    this.previousEditorSelection = this.editorInstance.getSelection();
  }

  symbolSelectorChanged(selectedVal) {
    switch (selectedVal) {
      case 'equals': {
        this.editorInstance.deleteText(0,5);
        this.editorInstance.insertText(
          this.previousEditorSelection,
          this.equalsUnicode + '  '+ this.hintUnicode
        );
        this.editorInstance.setSelection(this.previousEditorSelection.index + 11);
        this.hideSymbols = true;
        break;
      }
      case 'implies': {
        this.editorInstance.deleteText(0,5);
        this.editorInstance.insertText(
          this.previousEditorSelection,
          this.impliesUnicode + this.hintUnicode
        );
        this.editorInstance.setSelection(this.previousEditorSelection.index + 9);
        this.hideSymbols = true;
        break;
      }
      case 'followsFrom': {
        this.editorInstance.deleteText(0,5);
        this.editorInstance.insertText(
          this.previousEditorSelection,
          this.followsFromUnicode + this.hintUnicode
        );
        this.editorInstance.setSelection(this.previousEditorSelection.index + 9);
        this.hideSymbols = true;
        break;
      }
      case 'lessThan': {
        this.editorInstance.deleteText(0,5);
        this.editorInstance.insertText(
          this.previousEditorSelection,
          this.lessThanUnicode + '  '+ this.hintUnicode
        );
        this.editorInstance.setSelection(this.previousEditorSelection.index + 11);
        this.hideSymbols = true;
        break;
      }
      case 'greaterThan': {
        this.editorInstance.deleteText(0,5);
        this.editorInstance.insertText(
          this.previousEditorSelection,
          this.greaterThanUnicode + ' ' + this.hintUnicode
        );
        this.editorInstance.setSelection(this.previousEditorSelection.index + 11);
        this.hideSymbols = true;
        break;
      }
      case 'greaterThanOrEq': {
        this.editorInstance.deleteText(0,5);
        this.editorInstance.insertText(
          this.previousEditorSelection,
          this.greaterThanOrEqUnicode + '  ' + this.hintUnicode
        );
        this.editorInstance.setSelection(this.previousEditorSelection.index + 11);
        this.hideSymbols = true;
        break;
      }
      case 'lessThanOrEq': {
        this.editorInstance.deleteText(0,5);
        this.editorInstance.insertText(
          this.previousEditorSelection,
          this.lessThanOrEqUnicode + '  ' + this.hintUnicode
        );
        this.editorInstance.setSelection(this.previousEditorSelection.index + 11);
        this.hideSymbols = true;
        break;
      }
      default: {
        console.log('something other than equals was pressed');
        this.hideSymbols = true;
        break;
      }
    }
  }

  addNewThm() {
    this.editorService.toggleFormFilled();
  }

  addBindingCreated(quill) {

    this.editorInstance = quill;

    quill.on('text-change', function () {
      console.log('Text change!');
      this.hideSymbols = true;
    });

    // implies
    quill.keyboard.addBinding({key: 'm'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;i$/,
        offset: 7
      },
      (range, context) => {
        quill.deleteText(range.index - 7, 7); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 7, this.impliesUnicode + this.hintUnicode);
        quill.setSelection(range.index + 6);
      });

    // follows from
    quill.keyboard.addBinding({key: 'f'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;f$/,
        offset: 7
      },
      (range, context) => {
        quill.deleteText(range.index - 7, 7); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 7, this.followsFromUnicode + this.hintUnicode);
        quill.setSelection(range.index + 6);
      });

    // equals
    quill.keyboard.addBinding({key: 'q'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;e$/,
        offset: 7
      },
      (range, context) => {
        quill.deleteText(range.index - 7, 7); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 7, this.equalsUnicode + '  ' + this.hintUnicode);
        quill.setSelection(range.index + 8);
      });

    // less than
    quill.keyboard.addBinding({key: 't'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;l$/,
        offset: 7
      },
      (range, context) => {
        quill.deleteText(range.index - 7, 7); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 7, this.lessThanUnicode + '  ' + this.hintUnicode);
        quill.setSelection(range.index + 8);
      });

    // less than or equal to
    quill.keyboard.addBinding({key: 'e'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;l$/,
        offset: 7
      },
      (range, context) => {
        quill.deleteText(range.index - 7, 7); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 7, this.lessThanOrEqUnicode + '  ' + this.hintUnicode);
        quill.setSelection(range.index + 8);
      });


    // greater than
    quill.keyboard.addBinding({key: 't'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;g$/,
        offset: 7,
      },
      (range, context) => {
        quill.deleteText(range.index - 7, 7); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 7, this.greaterThanUnicode + '  ' + this.hintUnicode);
        quill.setSelection(range.index + 8);
      });

    // greater than or equal to
    quill.keyboard.addBinding({key: 'e'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;g$/,
        offset: 7,
      },
      (range, context) => {

        quill.deleteText(range.index - 7, 7); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 7, this.greaterThanOrEqUnicode + '  ' + this.hintUnicode);
        quill.setSelection(range.index + 8);
      });

    // ///////////////////////////////////////////inline symbols///////////////////////////////////////////

    // close paren
    quill.keyboard.addBinding({key: '9', shiftKey: true}, {
        // empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*$/
      },
      (range, context) => {
        quill.insertText(range.index, ' (  ) ');
        quill.setSelection(range.index + 3);
      });

    // close curly brace
    quill.keyboard.addBinding({key: 219, shiftKey: true}, {
        // empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*$/
      },
      (range, context) => {
        quill.insertText(range.index, ' {  } ');
        quill.setSelection(range.index + 3);
      });

    //close square brackets
    quill.keyboard.addBinding({key: 219}, {
        // empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*$/
      },
      (range, context) => {
        quill.insertText(range.index, ' [  ] ');
        quill.setSelection(range.index + 3);
      });


    // p
    quill.keyboard.addBinding({key: 't'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;i$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' ≺ ');
      });


    // poset
    quill.keyboard.addBinding({key: 't'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;r$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' ⪯ ');
      });

    // poset inverted
    quill.keyboard.addBinding({key: 'r'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;t$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' ⪰ ');
      });

    // p inverted
    quill.keyboard.addBinding({key: 'i'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;t$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' ≻ ');
      });

    // hash
    quill.keyboard.addBinding({key: 'h'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;h$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' # ');
      });

    // sigma
    quill.keyboard.addBinding({key: 'a'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;s$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' σ ');
      });

    // pi
    quill.keyboard.addBinding({key: 'i'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;p$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' π ');
      });

    // natural join
    quill.keyboard.addBinding({key: 'n'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;j$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' ⨝ ');
      });

    // big-O
    quill.keyboard.addBinding({key: 'o'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;b$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' Ο ');
      });

    // big omega
    quill.keyboard.addBinding({key: 'g'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;b$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' Ω ');
      });

    // big theta
    quill.keyboard.addBinding({key: 't'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;b$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' Θ ');
      });

    // phi
    quill.keyboard.addBinding({key: 'h'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;p$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' 𝜙 ');
      });

    // follows from
    quill.keyboard.addBinding({key: 'f'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;f$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' ' + this.followsFromUnicode + ' ');
      });

    // less than
    quill.keyboard.addBinding({key: 't'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;l$/

        // missing * and - and + characters and ^
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' ' + this.lessThanUnicode + ' ');
      });

    // less than or equal to
    quill.keyboard.addBinding({key: 'e'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;l$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' ' + this.lessThanOrEqUnicode + ' ');
      });

    // greater than
    quill.keyboard.addBinding({key: 't'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;g$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' ' + this.greaterThanUnicode + ' ');
      });


    // greater than or equal to
    quill.keyboard.addBinding({key: 'e'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;g$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' ' + this.greaterThanOrEqUnicode + ' ');
      });

    // left hint bracket
    quill.keyboard.addBinding({key: 'b'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;l$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, this.leftBracketUnicode);
      });

    // right hint bracket
    quill.keyboard.addBinding({key: 'b'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;r$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, this.rightBracketUnicode);
      });

    // implies
    quill.keyboard.addBinding({key: 'm'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;i$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' ' + this.impliesUnicode + ' ');
      });

    // equival
    quill.keyboard.addBinding({key: 'q'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;e$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' ' + this.equivalesUnicode + ' ');
      });

    // textual subsitution
    quill.keyboard.addBinding({key: 's'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;t$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' ' + this.textSubUnicode + ' ');
      });

    // element of
    quill.keyboard.addBinding({key: 'l'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;e$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' ' + this.elementOfUnicode + ' ');
      });

    // universe
    quill.keyboard.addBinding({key: 's'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;u$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' Ʊ ');
      });

    // proper subset
    quill.keyboard.addBinding({key: 'b'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;p$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' ' + this.properSubsetOfUnicode + ' ');
      });

    // proper superset
    quill.keyboard.addBinding({key: 'p'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;p$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' ' + this.properSupersetOfUnicode + ' ');
      });

    // subset
    quill.keyboard.addBinding({key: 'b'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;s$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' ' + this.subsetOfUnicode + ' ');
      });

    // superset
    quill.keyboard.addBinding({key: 'p'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;s$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' ' + this.supersetOfUnicode + ' ');
      });

    // empty set
    quill.keyboard.addBinding({key: 's'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;e$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' ' + this.emptySetUnicode + ' ');
      });


    // union
    quill.keyboard.addBinding({key: 'n'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;u$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' ' + this.unionUnicode + ' ');
      });

    // intersection
    quill.keyboard.addBinding({key: 'n'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;i$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' ' + this.intersectionUnicode + ' ');
      });

    // complement
    quill.keyboard.addBinding({key: 'o'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;c$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' ~ ');
      });


    // disjunction
    quill.keyboard.addBinding({key: 'r'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;o$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' ' + this.disjunctionUnicode + ' ');
      });

    // conjunction
    quill.keyboard.addBinding({key: 'n'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;a$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' ' + this.conjuctionUnicode + ' ');
      });

    // for all
    quill.keyboard.addBinding({key: 'a'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;f$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' ' + this.universalQuantifierUnicode);
      });

    // there exists
    quill.keyboard.addBinding({key: 'x'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;e$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' ' + this.existentialQuanitiferUnicode);
      });

    // power set
    quill.keyboard.addBinding({key: 's'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;p$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' P ');
      });

    // up arrow
    quill.keyboard.addBinding({key: 'a'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;u$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' ↑ ');
      });

    // right arrow
    quill.keyboard.addBinding({key: 'a'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;r$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' → ');
      });

    // left arrow
    quill.keyboard.addBinding({key: 'a'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;l$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' ← ');
      });

    // down arrow
    quill.keyboard.addBinding({key: 'a'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;d$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' ↓ ');
      });
    // cross product
    quill.keyboard.addBinding({key: 'p'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;c$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' × ');
      });

    // division symbol
    quill.keyboard.addBinding({key: 'v'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;d$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' ÷ ');
      });

    // function composition
    quill.keyboard.addBinding({key: 'c'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;f$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' ∙ ');
      });

    // function product
    quill.keyboard.addBinding({key: 'p'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;f$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' ∘ ');
      });

    // floating dot
    quill.keyboard.addBinding({key: 't'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;d$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, ' ⋅ ');
      });

    // star
    quill.keyboard.addBinding({key: 't'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;s$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, this.genQuantifierUnicode);
      });


    // brackets defintely different than les than

    /////////// //////////////////////// not + symbols //////////////////////// ////////////////////////

    // not
    quill.keyboard.addBinding({key: 't'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;no$/
      },
      (range, context) => {
        quill.deleteText(range.index - 3, 3); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 3, ' ¬ ');
      });

    // does not imply
    quill.keyboard.addBinding({key: 'm'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;ni$/
      },
      (range, context) => {
        quill.deleteText(range.index - 3, 3); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 3, ' ' + this.doesNotImplyUnicode + ' ');
      });

    // does not follow from
    quill.keyboard.addBinding({key: 'f'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;nf$/
      },
      (range, context) => {
        quill.deleteText(range.index - 3, 3); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 3, ' ' + this.doesNotFollowFromUnicode + ' ');
      });

    // not equal
    quill.keyboard.addBinding({key: 'q'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;ne$/
      },
      (range, context) => {
        quill.deleteText(range.index - 3, 3); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 3, ' ' + this.doesNotEqualUnicode + ' ');
      });

    //not equivales
    quill.keyboard.addBinding({key: 'v'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;ne$/
      },
      (range, context) => {
        quill.deleteText(range.index - 3, 3); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 3, ' ' + this.notEquivalesUnicode + ' ');
      });

    // not element of
    quill.keyboard.addBinding({key: 'l'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;ne$/
      },
      (range, context) => {
        quill.deleteText(range.index - 3, 3); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 3, ' ' + this.notElementOfUnicode + ' ');
      });

    // not a subset
    quill.keyboard.addBinding({key: 'b'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;ns$/
      },
      (range, context) => {
        quill.deleteText(range.index - 3, 3); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 3, ' ' + this.notSubsetOf + ' ');
      });

    // not a superset
    quill.keyboard.addBinding({key: 'p'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;ns$/
      },
      (range, context) => {
        quill.deleteText(range.index - 3, 3); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 3, ' ' + this.notSupersetOfUnicode + ' ');
      });

    // not a proper superset
    quill.keyboard.addBinding({key: 'p'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;np$/
      },
      (range, context) => {
        quill.deleteText(range.index - 3, 3); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 3, ' ' + this.notProperSupersetOfUnicode + ' ');
      });

    // not a proper subset
    quill.keyboard.addBinding({key: 'b'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;np$/
      },
      (range, context) => {
        quill.deleteText(range.index - 3, 3); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 3, ' ' + this.notProperSubsetOfUnicode + ' ');
      });

    ////////////////////////////////// natural numbers, etc ///////////////////////////////
    // natural numbers
    quill.keyboard.addBinding({key: 'n'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;n$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, this.naturalUnicode);
      });

    // integers
    quill.keyboard.addBinding({key: 'r'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;i$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, this.integerUnicode);
      });

    //rational
    quill.keyboard.addBinding({key: 'l'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;r$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, this.rationalUnicode);
      });

    //real numbers
    quill.keyboard.addBinding({key: 'n'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;r$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, this.realUnicode);
      });

    //booleans
    quill.keyboard.addBinding({key: 'n'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;b$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, this.booleanSymbol);
      });

    //end of proof
    quill.keyboard.addBinding({key: 'd'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;en$/
      },
      (range, context) => {
        quill.deleteText(range.index - 3, 3); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 3, this.endProofUnicode + this.endProofUnicode);
      });

    ////////////////////////// temporal //////////////////////////
    //next
    quill.keyboard.addBinding({key: 't'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;nx$/
      },
      (range, context) => {
        quill.deleteText(range.index - 3, 3); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 3, this.nextUnicode);
      });

    //until
    quill.keyboard.addBinding({key: 'l'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;ut$/
      },
      (range, context) => {
        quill.deleteText(range.index - 3, 3); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 3, this.untilUnicode);
      });

    //eventually
    quill.keyboard.addBinding({key: 't'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;ev$/
      },
      (range, context) => {
        quill.deleteText(range.index - 3, 3); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 3, this.eventuallyUnicode);
      });

    //always
    quill.keyboard.addBinding({key: 'w'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;al$/
      },
      (range, context) => {
        quill.deleteText(range.index - 3, 3); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 3, this.alwaysUnicode);
      });

    //plus
    quill.keyboard.addBinding({key: 's'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*plu$/
      },
      (range, context) => {
        quill.deleteText(range.index - 3, 3); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 3, 'plus ', {'bold': true, 'italic': true});
        quill.format('bold', false);
        quill.format('italic', false);
      });

    //gcd
    quill.keyboard.addBinding({key: 'd'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*gc$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, 'gcd ', {'bold': true, 'italic': true});
        quill.format('bold', false);
        quill.format('italic', false);
      });

    //mod
    quill.keyboard.addBinding({key: 'd'}, {
        empty: false,
        collapsed: true,
        prefix: /[[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*mo$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, 'mod ', {'bold': true, 'italic': true});
        quill.format('bold', false);
        quill.format('italic', false);
      });

    //lcd
    quill.keyboard.addBinding({key: 'd'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*lc$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, 'lcd ', {'bold': true, 'italic': true});
        quill.format('bold', false);
        quill.format('italic', false);
      });

    //lub lowest upper bound
    quill.keyboard.addBinding({key: 'b'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*lu$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, 'lub ', {'bold': true, 'italic': true});
        quill.format('bold', false);
        quill.format('italic', false);
      });

    //glb greatest lower bound
    quill.keyboard.addBinding({key: 'b'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*gl$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, 'glb ', {'bold': true, 'italic': true});
        quill.format('bold', false);
        quill.format('italic', false);
      });

    //abs
    quill.keyboard.addBinding({key: 's'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*ab$/
      },
      (range, context) => {
        quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 2, 'abs ', {'bold': true, 'italic': true});
        quill.format('bold', false);
        quill.format('italic', false);
      });

    //true
    quill.keyboard.addBinding({key: 'e'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*tru$/
      },
      (range, context) => {
        quill.deleteText(range.index - 3, 3); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 3, 'true ', 'italic', true);
        quill.format('italic', false);
      });

    //false
    quill.keyboard.addBinding({key: 'e'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*fals$/
      },
      (range, context) => {
        quill.deleteText(range.index - 4, 4); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 4, 'false ', 'italic', true);
        quill.format('italic', false);
      });

    //sum
    quill.keyboard.addBinding({key: 'm'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;su$/
      },
      (range, context) => {
        quill.deleteText(range.index - 3, 3); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 3, ' ∑');
      });

    //product
    quill.keyboard.addBinding({key: 'd'}, {
        empty: false,
        collapsed: true,
        prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*;pr$/
      },
      (range, context) => {
        quill.deleteText(range.index - 3, 3); // range.index-1 = user's cursor -1 -> where = character is
        quill.insertText(range.index - 3, ' ∏');
      });

      //wp
      quill.keyboard.addBinding({key: 'p'}, {
          empty: false,
          collapsed: true,
          prefix: /[/(){}╱∏∑◇○ʯ□≡=¬≢≠≥≤⇒⇐⇍⇏≔<>∈∅Ʊ⊂⊃⊆⊇∉⊄⊅⊈⊉∪∩~⋅*∘∙÷×Ρ↓↑←→ ℕℤℚℝ𝔹〈〉◃▹σ★∀∃⋁⋀≺⪯⪰≻ΩΟΘπ#𝜙⨝+-^a-zA-Zs]*w$/
        },
        (range, context) => {
          quill.deleteText(range.index - 2, 2); // range.index-1 = user's cursor -1 -> where = character is
          quill.insertText(range.index - 2, 'wp.S.R ','italic', true);
          quill.format('italic', false);
        });
  }

  setControl() {
    this.form.setControl('editor', new FormControl('test - new Control'));
  }

  setFocus($event) {
    $event.focus();
  }

  updateSelection($event: any) {
    if (this.editorInstance.getSelection()) {
      this.previousEditorSelection = this.editorInstance.getSelection();
    }
  }

  export() {
    const loader = document.getElementById('exportLoader');
    const exportBtn = (<HTMLInputElement> document.getElementById('exportBtn'));

    loader.style.visibility = 'visible';
    exportBtn.disabled = true;

    const text = this.editorInstance.getText();

    console.log(text);

    const arrayText = text.split('\n');

    const numHeaders = 4;

    if (arrayText.length >= 4) {
      const name = (arrayText[0] as string).replace(/Name:(?:\s)(.*)/gm, '$1');
      const pin = ((arrayText[1] as string)).replace(/Pin:(?:\s)(.*)/gm, '$1');
      const course = (arrayText[2] as string).replace(/Course:(?:\s)(.*)/gm, '$1');
      const assignment = (arrayText[3] as string).replace(/Assignment:(?:\s)(.*)/gm, '$1');

      const latexName = '\\textbf{' + name + '}\\\\' + '\n';
      const latexPin = '\\textbf{' + 'Pin: ' + pin + '}\\\\' + '\n';
      const latexCourse = '\\textbf{' + course + '}\\\\' + '\n';
      const latexAssignment = '\\textbf{' + "A"+ assignment + '}\\\\\\\\' + '\n';

      const heading = latexName + latexPin + latexCourse + latexAssignment;

      for (let i = 0; i < numHeaders; i++) {
        arrayText.shift();
      }

      const proofs = arrayText.join('\n');

      let compiler = new AntlrComponent();
      let compiledProofs = compiler.compile(proofs);

      let latex = compiler.preamble + heading + compiledProofs + compiler.postamble;

      this.http.post('http://localhost:4201/scribe/pdf', {
        text
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).subscribe((data: { base64: string }) => {
        let pdfDataURL = 'data:application/pdf;charset=binary;base64,' + data['base64'];

        let a = document.createElement('a');
        document.body.appendChild(a);
        a.href = pdfDataURL;
        a.download = (pin + 'a' + assignment + 'written').replace(/\s/g, '_');
        a.click();

        loader.style.visibility = 'hidden';
        exportBtn.disabled = false;
      });
    } else {
      alert("Please include the default headers.");

      loader.style.visibility = 'hidden';
      exportBtn.disabled = false;
    }

  }
}
