// src/app/shared/ui/rich-text-editor/rich-text-editor.component.ts
import {
  Component,
  OnDestroy,
  OnInit,
  forwardRef,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { Editor, Toolbar, NgxEditorModule } from 'ngx-editor';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import DOMPurify from 'dompurify';

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxEditorModule,
    PickerModule,
    TranslateModule,
  ],
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true,
    },
  ],
})
export class RichTextEditorComponent
  implements OnInit, OnDestroy, ControlValueAccessor
{
  // ========== Inputs ==========
  @Input() placeholder = 'Scrivi qui…';
  @Input() emojiEnabled = true;
  @Input() sanitizeOnOutput = true;
  @Input() toolbar: Toolbar = [
    ['bold', 'italic', 'underline', 'strike'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h3', 'h4'] }],
    ['link'],
    ['undo', 'redo'],
  ];
  @Input() autofocus = false;
  @Input() set disabled(v: boolean) {
    v
      ? this.control.disable({ emitEvent: false })
      : this.control.enable({ emitEvent: false });
  }
  @Input() error = false;

  // ========== Outputs ==========
  @Output() submitted = new EventEmitter<void>();
  @Output() lengthChange = new EventEmitter<number>();

  // ========== Internals ==========
  editor!: Editor;
  showEmoji = false;
  control = new FormControl<string>('', { nonNullable: true });

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    this.editor = new Editor();

    // sync inner control -> outer form
    this.control.valueChanges.subscribe((html) => {
      const out = this.sanitizeOnOutput
        ? DOMPurify.sanitize(html ?? '', { USE_PROFILES: { html: true } })
        : html ?? '';
      this.onChange(out);
      this.lengthChange.emit(this.plainLen(out));
    });

    if (this.autofocus) {
      setTimeout(() => this.editor.commands.focus());
    }
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }

  // ========== CVA ==========
  writeValue(value: string | null): void {
    this.control.setValue(value ?? '', { emitEvent: false });
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

  // ========== Public ==========
  insertEmoji(e: any) {
    const emoji = e?.emoji?.native ?? e?.native ?? '';

    if (!emoji) {
      console.warn('⚠️ No emoji found in event payload');
      return;
    }

    // Focus the editor so the selection is valid
    this.editor.commands.focus();

    const view = this.editor.view;
    if (!view) {
      console.warn('⚠️ Editor view not ready');
      return;
    }

    // Insert at current selection using ProseMirror's transaction
    const { state, dispatch } = view;
    dispatch(state.tr.insertText(emoji));

    // Optional: collapse emoji picker and mark as touched
    this.showEmoji = false;
    this.markTouched();

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
