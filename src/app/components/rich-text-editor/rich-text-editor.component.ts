// src/app/shared/ui/rich-text-editor/rich-text-editor.component.ts
import {
  Component,
  OnDestroy,
  OnInit,
  forwardRef,
  Input,
  Output,
  EventEmitter,
  effect,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
  FormControl,
  Validators,
} from '@angular/forms';
import { Editor, Toolbar, NgxEditorModule } from 'ngx-editor';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import DOMPurify from 'dompurify';

// Optional pipes from earlier (bring them if you use the examples below)
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { StripHtmlLengthPipe } from '../../pipes/strip-html-length.pipe';

type Heading = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

@Component({
  selector: 'app-rich-text-editor',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxEditorModule,
    PickerModule,
    SafeHtmlPipe,
    StripHtmlLengthPipe,
  ],
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true,
    },
  ],
})
export class RichTextEditorComponent
  implements OnInit, OnDestroy, ControlValueAccessor
{
  // ========== Inputs (customize behavior) ==========
  /** Placeholder shown inside the editor */
  @Input() placeholder = 'Scrivi qui…';

  /** Max plain-text length (HTML tags excluded). Set 0 to disable */
  @Input() maxLength = 2000;

  /** Show live char counter (based on plain text) */
  @Input() showCounter = true;

  /** Whether the field is required (adds validator if true) */
  @Input() required = false;

  /** Enable emoji picker button */
  @Input() emojiEnabled = true;

  /** Sanitize value before emitting to outer form/control */
  @Input() sanitizeOnOutput = true;

  /** Provide a full toolbar to override defaults */
  @Input() toolbar: Toolbar = [
    ['bold', 'italic', 'underline', 'strike'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h3', 'h4'] }],
    ['link'],
    ['undo', 'redo'],
  ];

  /** Autofocus editor on init */
  @Input() autofocus = false;

  /** Disabled state from parent form */
  @Input() set disabled(v: boolean) {
    v
      ? this.control.disable({ emitEvent: false })
      : this.control.enable({ emitEvent: false });
  }

  /** Emit when user clicks submit (optional workflow) */
  @Output() submitted = new EventEmitter<void>();

  /** Emit current plain-text length (optional) */
  @Output() lengthChange = new EventEmitter<number>();

  // ========== Internals ==========
  editor!: Editor;
  showEmoji = false;

  control = new FormControl<string>('', { nonNullable: true });

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    this.editor = new Editor();

    // React to internal control changes and propagate outside (ControlValueAccessor)
    this.control.valueChanges.subscribe((html) => {
      const out = this.sanitizeOnOutput
        ? DOMPurify.sanitize(html ?? '', { USE_PROFILES: { html: true } })
        : html ?? '';
      this.onChange(out);
      this.lengthChange.emit(this.plainLen(out));
    });

    if (this.autofocus) {
      // Let the view render first
      setTimeout(() => {
        // ngx-editor focuses when the host gains focus via click; for programmatic autofocus,
        // we can simulate by toggling selection via command
        this.editor.commands.focus();
      });
    }
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }

  // ========== ControlValueAccessor ==========
  writeValue(value: string | null): void {
    const v = value ?? '';
    this.control.setValue(v, { emitEvent: false });
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled
      ? this.control.disable({ emitEvent: false })
      : this.control.enable({ emitEvent: false });
  }

  // ========== Validator (NG_VALIDATORS) ==========
  validate(control: AbstractControl): ValidationErrors | null {
    const html = this.control.value ?? '';
    const len = this.plainLen(html);

    if (this.required && len === 0) {
      return { required: true };
    }
    if (this.maxLength > 0 && len > this.maxLength) {
      return {
        maxPlainTextLen: { requiredLength: this.maxLength, actualLength: len },
      };
    }
    return null;
  }

  // ========== Public API ==========
  insertEmoji(e: any) {
    const emoji = e?.emoji?.native || e?.native || '';
    if (emoji) {
      this.editor.commands.insertText(emoji);
      this.showEmoji = false;
      this.markTouched();
    }
  }

  submit() {
    this.submitted.emit();
    this.markTouched();
  }

  markTouched() {
    this.onTouched?.();
    this.control.markAsTouched();
  }

  get plainTextLength(): number {
    return this.plainLen(this.control.value ?? '');
  }

  // ========== Helpers ==========
  private plainLen(html: string): number {
    const div = document.createElement('div');
    div.innerHTML = html || '';
    return (div.textContent || div.innerText || '').length;
  }
}
